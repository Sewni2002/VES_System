// Controllers/SPsubmissionController.js
const fs = require("fs");
const path = require("path");
const Submission = require("../Model/Submission");
const ZipSubmission = require("../Model/ZipSubmission");
const StudentAlt = require("../Model/StudentGrpSWPA");
const { Student: PrimaryStudent } = require("../Model/Student");
const Group = require("../Model/GroupsSWPA");
const Deadline = require("../Model/Deadline");

const multer = require("multer");

// ---------------- Multer ----------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ---------------- Helper ----------------
function normalize(s) {
  if (!s && s !== 0) return "";
  return String(s).replace(/[{}]/g, "").trim();
}

async function getStudentAndGroup(rawStudentId) {
  const studentId = normalize(rawStudentId);
  if (!studentId) throw { status: 400, message: "Invalid studentID" };

  // 1) Try primary student
  let student = null;
  try {
    if (PrimaryStudent) {
      student = await PrimaryStudent.findOne({
        $or: [
          { studentID: studentId },
          { email: studentId },
          { idNumber: studentId },
        ],
      }).lean();
    }
  } catch (e) {
    console.warn("PrimaryStudent lookup failed:", e);
  }

  // 2) Try alternate "student group" document (the one that stores members)
  if (!student) {
    student = await StudentAlt.findOne({
      $or: [
        { idNumber: studentId },
        { studentID: studentId },
        { name: studentId },
        { "members.studentID": studentId },
      ],
    }).lean();
  }

  if (!student) throw { status: 404, message: "Student not found" };

  // 3) Derive gid
  const rawGid =
    student.gid || student.groupId || student.groupID || student.group || "";
  const gid = normalize(rawGid).toUpperCase();

  // 4) Fetch Group collection (if present)
  let groupDoc = null;
  if (gid) {
    groupDoc = await Group.findOne({ gid: { $in: [gid, `{${gid}}`, gid.toLowerCase(), `{${gid.toLowerCase()}}`] } });
  }

  const group = groupDoc
    ? groupDoc.toObject()
    : {
        gid: gid || "",
        groupName: student.groupName || student.name || `Group ${gid || "?"}`,
        members: student.members || [],
        assignedLocation: student.assignedLocation || "-",
        assignedDate: student.assignedDate || null,
        _id: null,
      };

  // 5) Determine role heuristically from members
  let role = "member";
  if (Array.isArray(group.members) && group.members.length > 0) {
    const firstMemberId = normalize(group.members[0].studentID).toUpperCase();
    role = studentId.toUpperCase() === firstMemberId ? "leader" : "member";
  }

  return { student, group, gid, role };
}

// ---------------- Deadline helpers ----------------
async function checkDeadline(moduleCode = null) {
  const query = { type: "submission" };
  if (moduleCode) query.moduleCode = moduleCode;
  const doc = await Deadline.findOne(query).sort({ endDate: -1 });
  return doc ? new Date(doc.endDate) : null;
}

const getDeadline = async (req, res) => {
  try {
    const moduleCode = req.query.moduleCode || null;
    const query = { type: "submission" };
    if (moduleCode) query.moduleCode = moduleCode;

    const doc = await Deadline.findOne(query).sort({ endDate: -1 });
    if (!doc) return res.status(404).json({ error: "No deadline set" });
    return res.json({ endDate: doc.endDate });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ---------------- TEXT submission ----------------
const createTextSubmission = async (req, res) => {
  try {
    const { studentID, code, moduleCode, languageType, scope, notes, groupID, type } = req.body;

    if (!studentID || !code)
      return res.status(400).json({ error: "studentID and code required" });

    // Get student & group info if groupID not provided
    
    const deadline = await checkDeadline(moduleCode);
    if (deadline && Date.now() > deadline.getTime())
      return res.status(403).json({ error: "Deadline passed" });

    const submission = new Submission({
      groupID: groupID,
      studentID,
      type: type || "text",  // fallback to 'text' if not sent
      code,
      languageType,
      scope,
      notes,
      moduleCode: moduleCode || null,
      dateSubmit: Date.now(),
    });

    await submission.save();
    return res.status(201).json({ message: "Text submission saved", submission });
  } catch (err) {
    console.error("createTextSubmission error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};


// ---------------- ZIP submission ----------------
const createZipSubmission = async (req, res) => {
  try {
    const { studentID, moduleCode } = req.body;
    if (!studentID)
      return res.status(400).json({ error: "studentID required" });

    const { student, group, gid, role } = await getStudentAndGroup(studentID);
    const deadline = await checkDeadline(moduleCode);
    if (deadline && Date.now() > deadline.getTime())
      return res.status(403).json({ error: "Deadline passed" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "At least one ZIP file required" });

    const saved = [];
    for (const file of req.files) {
      const submission = new Submission({
        groupID: gid,
        groupObjectId: group?._id || null,
        studentID: normalize(student.studentID || student.idNumber),
        studentName: student.name || "",
        role,
        type: "zip",
        zip: {
          originalName: file.originalname,
          storagePath: path.join("uploads", file.filename),
          mimeType: file.mimetype,
          size: file.size,
        },
        moduleCode: moduleCode || null,
        dateSubmit: Date.now(),
      });
      await submission.save();
      saved.push(submission);
    }

    return res.status(201).json({ message: "ZIP submissions saved", submissions: saved });
  } catch (err) {
    console.error("createZipSubmission error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};


// ---------------- Get all group submissions ----------------
const getGroupSubmissions = async (req, res) => {
  try {
    const rawGid = normalize(req.params.gid);
    const gid = rawGid.toUpperCase();
    const variants = [gid, `{${gid}}`, gid.toLowerCase(), `{${gid.toLowerCase()}}`, ""].filter(Boolean);

    const textSubs = await Submission.find({ groupID: { $in: variants } })
      .sort({ dateSubmit: -1 })
      .lean();
    const zipSubs = await ZipSubmission.find({ groupID: { $in: variants } })
      .sort({ dateSubmit: -1 })
      .lean();

    return res.json({ text: textSubs, zip: zipSubs });
  } catch (err) {
    console.error("getGroupSubmissions error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ---------------- Edit text submission ----------------
const editSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ error: "Not found" });

    // require studentID in body for authorization
    if (!req.body.studentID) return res.status(400).json({ error: "studentID required in request body" });

    const moduleCode = req.body.moduleCode || submission.moduleCode || null;
    const deadline = await checkDeadline(moduleCode);
    if (deadline && Date.now() > deadline.getTime())
      return res.status(403).json({ error: "Deadline passed. Cannot edit." });

    if (normalize(submission.studentID) !== normalize(req.body.studentID))
      return res.status(403).json({ error: "Only uploader may edit" });

    if (submission.type !== "text") return res.status(400).json({ error: "Only text submissions are editable" });

    const { languageType, scope, notes, file } = req.body;
    if (languageType) submission.languageType = languageType;
    if (scope) submission.scope = scope;
    if (notes !== undefined) submission.notes = notes;
    if (file?.content) submission.code = file.content;
    if (moduleCode) submission.moduleCode = moduleCode;

    await submission.save();
    return res.json({ message: "Submission updated", submission });
  } catch (err) {
    console.error("editSubmission error:", err);
    return res.status(500).json({ error: "Server error editing" });
  }
};

// ---------------- Delete submission (text or zip) ----------------
const deleteSubmission = async (req, res) => {
  try {
    const studentID = req.body.studentID || req.query.studentID;
    if (!studentID) return res.status(400).json({ error: "studentID required" });

    // Try text submission first
    let submission = await Submission.findById(req.params.id);
    let type = "text";

    if (!submission) {
      submission = await ZipSubmission.findById(req.params.id);
      type = "zip";
    }

    if (!submission) return res.status(404).json({ error: "Not found" });

    const moduleCode = submission.moduleCode || null;
    const deadline = await checkDeadline(moduleCode);
    if (deadline && Date.now() > deadline.getTime())
      return res.status(403).json({ error: "Deadline passed. Cannot delete." });

    if (normalize(submission.studentID) !== normalize(studentID))
      return res.status(403).json({ error: "Only uploader may delete" });

    if (type === "zip" && submission.zip?.storagePath) {
      try {
        const abs = path.resolve(submission.zip.storagePath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch (e) {
        console.warn("Could not delete zip file:", e);
      }
      await ZipSubmission.findByIdAndDelete(submission._id);
    } else {
      await Submission.findByIdAndDelete(submission._id);
    }

    return res.json({ message: "Submission deleted" });
  } catch (err) {
    console.error("deleteSubmission error:", err);
    return res.status(500).json({ error: "Server error deleting" });
  }
};


// ---------------- Get all submissions by studentID ----------------
const getSubmissionsByStudent = async (req, res) => {
  try {
    const studentID = normalize(req.params.studentID);
    if (!studentID) return res.status(400).json({ error: "studentID required" });

    const textSubs = await Submission.find({ studentID }).sort({ dateSubmit: -1 }).lean();
    const zipSubs = await ZipSubmission.find({ studentID }).sort({ dateSubmit: -1 }).lean();

    return res.json({ text: textSubs, zip: zipSubs });
  } catch (err) {
    console.error("getSubmissionsByStudent error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



module.exports = {
  createTextSubmission,
   getSubmissionsByStudent,
  createZipSubmission,
  getGroupSubmissions,
  editSubmission,
  deleteSubmission,
  getDeadline,
  upload,
};


