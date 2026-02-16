const express = require("express");
const router = express.Router();
const Student = require("../Model/StudentGrpSWPA");

// GET group by studentID (unchanged)
router.get("/group-by-student/:studentID", async (req, res) => {
  try {
    const studentID = req.params.studentID?.trim();
    if (!studentID) return res.status(400).json({ error: "Missing studentID" });

    const student = await Student.findOne({ "members.studentID": { $regex: `^${studentID}$`, $options: "i" } });
    if (!student) return res.status(404).json({ error: "Student not found" });

    const group = {
      gid: student.gid || (student.groupId ? String(student.groupId) : "-"),
      groupName: student.name || "-",
      groupTopic: student.topic || "-",
      assignedLocation: student.assignedLocation || "-",
      assignedDate: student.assignedDate || null,
      sessionId: student.sessionId || student.session || undefined,
    };

    const members = (student.members || []).map(m => ({
      studentID: String(m.studentID),
      name: m.name || ""
    }));

    const memberRoles = student.memberRoles || [];

    return res.json({ group, members, memberRoles });
  } catch (err) {
    console.error("Error fetching group for student:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// NEW: Save member roles
router.post("/assign-roles/:gid", async (req, res) => {
  try {
    const gid = req.params.gid?.trim();
    const { roles } = req.body; // roles = [{studentID, role}]
    if (!gid || !Array.isArray(roles)) return res.status(400).json({ error: "Invalid request" });

    const studentGroup = await Student.findOne({ gid });
    if (!studentGroup) return res.status(404).json({ error: "Group not found" });

    // Filter valid roles and assign
    const validRoles = ["Leader", "Member", "Designer", "Tester", "Frontend", "Backend"];
    const memberRoles = roles.map(r => ({
      studentID: r.studentID,
      name: studentGroup.members.find(m => m.studentID === r.studentID)?.name || "",
      role: validRoles.includes(r.role) ? r.role : ""
    }));

    studentGroup.memberRoles = memberRoles;
    await studentGroup.save();

    return res.json({ message: "Roles assigned successfully", memberRoles });
  } catch (err) {
    console.error("Error assigning roles:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
