const mongoose = require("mongoose");
const LICStudent = require("../Model/LICStudent");
const LICGroup = require("../Model/LICGroup");
const LICTopic = require("../Model/LICTopic");
const Group = require("../Model/Group"); // simplified group model
const Student = require("../Model/StudentGrp");
const GroupSWPA = require("../Model/GroupsSWPA");
const StudentSWPA = require("../Model/StudentGrpSWPA");

// NOTE: file is named "groupingEngine.js" (matches this import)
const { buildDraft } = require("../Service/groupingEngine");

// POST /api/groups/generate-draft
exports.generateDraft = async (req, res) => {
  try {
    const {
      year,
      semester,
      moduleCode = "",
      groupSize,
      gpaRule,
      strategy = "sequential",
      topicStrategy = "none",
      onlyUnassigned = false,

      // NEW: optional soft-balancing flags from frontend
      balance = {}, // { gender: boolean, religion: boolean }
    } = req.body;

    const minSize = Number(groupSize?.min);
    const maxSize = Number(groupSize?.max);

    if (!year || !semester || !minSize || !maxSize) {
      return res
        .status(400)
        .json({ message: "year, semester, groupSize(min,max) are required" });
    }

    const query = {
      year: Number(year),
      semester: Number(semester),
      isActive: true,
    };
    if (moduleCode) query.moduleCode = String(moduleCode);
    if (onlyUnassigned) query.groupId = { $in: [null, "", undefined] };

    // 1) Students
    const students = await LICStudent.find(query).lean();
    if (!students.length) {
      return res
        .status(404)
        .json({ message: "No students found for given criteria." });
    }

    // 2) Topics for the same cohort
    const topics = await LICTopic.find({
      year: Number(year),
      semester: Number(semester),
      moduleCode: String(moduleCode || ""),
    })
      .sort({ topicId: 1 })
      .lean();

    // 3) Build draft (now includes optional gender/religion balancing)
    const { draftGroups, summary } = buildDraft({
      year: Number(year),
      semester: Number(semester),
      moduleCode: String(moduleCode || ""),
      students,
      topics,
      rules: {
        minSize,
        maxSize,
        gpaRule,
        strategy,
        topicStrategy,

        // pass soft balancing choices to the engine
        balance: {
          gender: !!balance.gender,
          religion: !!balance.religion,
        },
      },
    });

    return res.json({ summary, draftGroups });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Generate failed" });
  }
};

// helper to generate unique group IDs
const generateGroupId = async (year, semester, moduleCode) => {
  const regex = new RegExp(`^${moduleCode}-Y${year}S${semester}-(\\d{3,})$`);
  const latestGroup = await LICGroup.find({ year, semester, moduleCode })
    .sort({ assignedDate: -1 })
    .lean();

  let maxNum = 0;
  latestGroup.forEach((g) => {
    const match = g.groupId.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1].slice(0, -3));
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = (maxNum + 1).toString().padStart(3, "0");
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `${moduleCode}-Y${year}S${semester}-${nextNum}${randomDigits}`;
};

// POST /api/groups/save
exports.saveGroups = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = req.body;
    const assignedBy = body?.assignedBy || "LIC Officer";
    const incomingGroups = Array.isArray(body) ? body : body?.groups;

    if (!Array.isArray(incomingGroups) || !incomingGroups.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No groups provided to save." });
    }

    const now = new Date();
    const toInsert = [];
    const studentDocs = [];

    for (const g of incomingGroups) {
      const year = Number(g.year);
      const semester = Number(g.semester);
      const moduleCode = String(g.moduleCode || "MOD");

      const groupId = g.groupId || (await generateGroupId(year, semester, moduleCode));

      const members = (g.members || []).map((m) => ({
        studentDocId: m.studentDocId,
        studentId: m.studentId,
        name: m.name,
        currentGPA: m.currentGPA ?? null,
      }));

      toInsert.push({
        groupId,
        groupName: `Group ${groupId}`,
        year,
        semester,
        moduleCode: String(g.moduleCode || ""),
        members,
        topicId: g.topicId || null,
        topicName: g.topicName || null,
        assignedDate: now,
        assignedBy,
      });
    }

    // Insert groups
    const saved = await LICGroup.insertMany(toInsert, { session });

    // Update students with groupId + create simplified collections
    const bulkOps = [];
    for (const grp of saved) {
      const studentDocIds = (grp.members || [])
        .map((m) => m.studentDocId)
        .filter(Boolean);
      if (studentDocIds.length) {
        bulkOps.push({
          updateMany: {
            filter: { _id: { $in: studentDocIds } },
            update: { $set: { groupId: grp.groupId, isActive: false } },
          },
        });
      }

      const studentIds = (grp.members || []).map((m) => m.studentId);
      const insertedGroup = await Group.create(
        [
          {
            groupName: `Group ${grp.groupId}`,
            members: studentIds,
            assignedDate: grp.assignedDate,
            gid: grp.groupId,
          },
        ],
        { session }
      );

      (grp.members || []).forEach((m) => {
        studentDocs.push({
          idNumber: m.studentId,
          name: m.name,
          groupId: grp._id,
          topic: grp.topicName || null,
          gid: insertedGroup[0].gid,
        });
      });

      // SWPA mirrors
      const assignedLocation = grp.assignedLocation || "Main Campus";
      const groupSWPADoc = await GroupSWPA.create(
        [
          {
            groupName: `Group ${grp.groupId}`,
            members: (grp.members || []).map((m) => ({
              studentID: m.studentId,
              name: m.name,
            })),
            assignedDate: grp.assignedDate,
            assignedLocation,
            gid: grp.groupId,
          },
        ],
        { session }
      );

      const studentSWPAEntries = (grp.members || []).map((m) => ({
        idNumber: m.studentId,
        name: m.name,
        groupId: groupSWPADoc[0]._id,
        gid: grp.groupId,
        topic: grp.topicName || null,
        members: (grp.members || []).map((s) => ({
          studentID: s.studentId,
          name: s.name,
        })),
      }));

      if (studentSWPAEntries.length) {
        await StudentSWPA.insertMany(studentSWPAEntries, { session });
      }
    }

    if (studentDocs.length) {
      await Student.insertMany(studentDocs, { session });
    }
    if (bulkOps.length) {
      await LICStudent.bulkWrite(bulkOps, { session });
    }

    await session.commitTransaction();
    return res.json({ message: "Groups saved successfully", saved: saved.length });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: err.message || "Save failed" });
  } finally {
    session.endSession();
  }
};

// GET /api/groups
exports.listGroups = async (req, res) => {
  try {
    const { year, semester, page = 1, limit = 100, moduleCode } = req.query;
    const q = {};
    if (year) q.year = Number(year);
    if (semester) q.semester = Number(semester);
    if (moduleCode) q.moduleCode = String(moduleCode);

    const items = await LICGroup.find(q)
      .sort({ assignedDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    const shaped = items.map((g) => ({
      ...g,
      membersCount: g.members?.length ?? 0,
    }));

    const total = await LICGroup.countDocuments(q);
    return res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      items: shaped,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "List failed" });
  }
};

// GET /api/groups/:id
exports.getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });
    const doc = await LICGroup.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Read failed" });
  }
};

// DELETE /api/groups/:id
exports.deleteGroup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid id" });
    }
    const group = await LICGroup.findById(id).session(session);
    if (!group) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Not found" });
    }

    const studentDocIds = (group.members || [])
      .map((m) => m.studentDocId)
      .filter(Boolean);
    if (studentDocIds.length) {
      await LICStudent.updateMany(
        { _id: { $in: studentDocIds }, groupId: group.groupId },
        { $set: { groupId: null } },
        { session }
      );
    }

    await LICGroup.deleteOne({ _id: id }, { session });
    await session.commitTransaction();
    return res.json({ message: "Deleted" });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: err.message || "Delete failed" });
  } finally {
    session.endSession();
  }
};
