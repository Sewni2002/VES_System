// controllers/SPschedulerController.js
const mongoose = require("mongoose");
const StudentGroup = require("../Model/StudentGrpSWPA"); // group data with members
const Scheduler = require("../Model/Scheduler");

// Normalize helper
function normalize(value) {
  if (!value && value !== 0) return "";
  return String(value).replace(/[{}]/g, "").trim();
}

// 🔍 Controller: Get Viva Schedule for a Student
exports.getVivaForStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) return res.status(400).json({ error: "Missing studentID" });

    const studentID = normalize(sid);

    // Step 1️⃣ — Find group containing this student (case-insensitive)
    const groupDoc = await StudentGroup.findOne({
      "members.studentID": { $regex: `^${studentID}$`, $options: "i" },
    });

    if (!groupDoc) {
      return res.status(404).json({ error: "Student not found in any group" });
    }

    // Step 2️⃣ — Extract and normalize group ID
    const groupID =
      groupDoc.gid ||
      (groupDoc.groupId ? String(groupDoc.groupId) : null) ||
      null;

    if (!groupID) {
      return res.status(404).json({ error: "Group ID not assigned" });
    }

    // Step 3️⃣ — Try to find the relevant Viva schedule for this group
    const variants = [groupID, `{${groupID}}`]; // handle brace-wrapped formats
    const vivaSchedule = await Scheduler.findOne({
      groupId: { $in: variants },
    });

    if (!vivaSchedule) {
      return res
        .status(404)
        .json({ error: "No Viva Schedule found for this group" });
    }

    // Step 4️⃣ — Construct clean, unified response
    const response = {
      studentID,
      group: {
        gid: groupID,
        groupName: groupDoc.name || "-",
        groupTopic: groupDoc.topic || "-",
      },
      members: (groupDoc.members || []).map((m) => ({
        studentID: String(m.studentID),
        name: m.name || "",
      })),
      scheduler: {
        groupId: vivaSchedule.groupId,
        topic: vivaSchedule.groupTopic || "-",
        hall: vivaSchedule.hallNumber || "-",
        instructor: vivaSchedule.instructorId || "-",
        substituteInstructor: vivaSchedule.substituteInstructor || "-",
        scheduledDate:
          vivaSchedule.scheduledDateTime || vivaSchedule.startTime || null,
        startTime: vivaSchedule.startTime || "-",
        endTime: vivaSchedule.endTime || "-",
        sessionId: vivaSchedule.sessionId || "-",
        status: vivaSchedule.status || "Pending",
        notes: vivaSchedule.notes || "",
      },
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Error in getVivaForStudent:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
