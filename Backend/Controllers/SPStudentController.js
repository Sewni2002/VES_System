const bcrypt = require("bcryptjs");
const {
  Student,
  Y01_Sem01Stud,
  Y01_Sem02Stud,
  Y02_Sem01Stud,
  Y02_Sem02Stud,
  Y03_Sem01Stud,
  Y03_Sem02Stud,
} = require("../Model/Student");

const StudentAlt = require("../Model/StudentGrpSWPA");

// ------------------- Helper -------------------
function normalizeID(s) {
  if (!s && s !== 0) return "";
  return String(s).replace(/[{}]/g, "").trim();
}

// ------------------- Register Student -------------------
const registerStudent = async (req, res) => {
  try {
    const { iname, fname, email, password, address, vivaregstatus, academic_status } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent)
      return res.status(400).json({ error: "Student already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      iname,
      fname,
      studentID: "STD-" + Date.now(),
      email,
      password: hashedPassword,
      address,
      vivaregstatus,
      academic_status,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------- Get Student by ID -------------------
const getStudentByID = async (req, res) => {
  try {
    const studentID = normalizeID(req.params.studentID || "");

    if (!studentID) return res.status(400).json({ error: "studentID required" });

    // Try primary Student collection
    let student = await Student.findOne({ studentID });

    // Fallback: StudentAlt collection
    let alt = null;
    if (!student) {
      alt = await StudentAlt.findOne({
        $or: [
          { studentID },
          { idNumber: studentID },
          { email: studentID },
          { name: studentID },
        ],
      });
    }

    if (!student && !alt) return res.status(404).json({ error: "Student not found" });

    // Check semester collections
    const semesterModels = [
      Y01_Sem01Stud,
      Y01_Sem02Stud,
      Y02_Sem01Stud,
      Y02_Sem02Stud,
      Y03_Sem01Stud,
      Y03_Sem02Stud,
    ];
    let sem = null;
    for (const M of semesterModels) {
      sem = await M.findOne({ studentID });
      if (sem) break;
    }

    // Merge fields
    const src = student || alt;
    const response = {
      studentID: src.studentID || src.idNumber || "",
      iname: src.iname || src.name || src.fname || "",
      fname: src.fname || "",
      email: src.email || "",
      photo: src.photo || (sem ? sem.photo : "/default-avatar.jpg"),
      vivaregstatus: typeof src.vivaregstatus !== "undefined" ? src.vivaregstatus : false,
      academic_status: src.academic_status || "",
      groupID: src.groupID || src.groupId || src.gid || src.group || "",
      phone: sem?.phone || src.phone || "",
      faculty: sem?.faculty || src.faculty || "",
      payment_status: typeof sem?.payment_status !== "undefined" ? sem.payment_status : false,
      enrolledDate: sem?.enrolledDate || src.enrolledDate || null,
    };

    res.json(response);
  } catch (err) {
    console.error("Error retrieving student:", err);
    res.status(500).json({ error: "Server error retrieving student" });
  }
};

// ------------------- Update Student -------------------
const updateStudent = async (req, res) => {
  try {
    const studentID = normalizeID(req.params.studentID || "");
    const { phone, profilePic } = req.body;

    const updateData = {};
    if (typeof phone !== "undefined") updateData.phone = phone;
    if (profilePic && profilePic.startsWith("data:")) updateData.photo = profilePic;

    // Update primary collection
    let student = null;
    if (Object.keys(updateData).length > 0) {
      student = await Student.findOneAndUpdate(
        { studentID },
        { $set: updateData },
        { new: true }
      );
    } else {
      student = await Student.findOne({ studentID });
    }

    // Update alternative collection if not found in primary
    let altUpdated = null;
    if (!student) {
      const altQuery = { $or: [{ studentID }, { idNumber: studentID }, { email: studentID }] };
      if (Object.keys(updateData).length > 0) {
        altUpdated = await StudentAlt.findOneAndUpdate(altQuery, { $set: updateData }, { new: true });
      } else {
        altUpdated = await StudentAlt.findOne(altQuery);
      }
      if (!altUpdated) return res.status(404).json({ error: "Student not found" });
    }

    // Update semester collection if exists
    const semesterModels = [
      Y01_Sem01Stud,
      Y01_Sem02Stud,
      Y02_Sem01Stud,
      Y02_Sem02Stud,
      Y03_Sem01Stud,
      Y03_Sem02Stud,
    ];
    let semUpdated = null;
    for (const M of semesterModels) {
      const sem = await M.findOne({ studentID });
      if (sem) {
        const semUpdate = {};
        if (typeof phone !== "undefined") semUpdate.phone = phone;
        if (profilePic && profilePic.startsWith("data:")) semUpdate.photo = profilePic;
        semUpdated = await M.findOneAndUpdate({ studentID }, { $set: semUpdate }, { new: true });
        break;
      }
    }

    // Build response
    const src = student || altUpdated;
    const resp = {
      studentID: src.studentID || src.idNumber || "",
      iname: src.iname || src.name || src.fname || "",
      fname: src.fname || "",
      email: src.email || "",
      photo: src.photo || (semUpdated ? semUpdated.photo : "/default-avatar.jpg"),
      vivaregstatus: typeof src.vivaregstatus !== "undefined" ? src.vivaregstatus : false,
      academic_status: src.academic_status || "",
      groupID: src.groupID || src.groupId || src.gid || src.group || "",
      phone: semUpdated?.phone || src.phone || "",
      faculty: semUpdated?.faculty || src.faculty || "",
      payment_status: typeof semUpdated?.payment_status !== "undefined" ? semUpdated.payment_status : false,
      enrolledDate: semUpdated?.enrolledDate || src.enrolledDate || null,
    };

    res.json(resp);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ error: "Server error updating student" });
  }
};

module.exports = { registerStudent, getStudentByID, updateStudent };
