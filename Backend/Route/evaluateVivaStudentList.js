const express = require("express");
const router = express.Router();
const Group = require("../Model/Group");
const StudentSubmission = require("../Model/StudentSubmission");
const AutomatedMark = require("../Model/AutomatedMarkIS");

// Get all students in a group and mark if they submitted
router.get("/group-students/:gid", async (req, res) => {
  try {
    const { gid } = req.params;

    // 1️⃣ Get group
    const group = await Group.findOne({ gid });
    if (!group) return res.status(404).json({ message: "Group not found" });

    // 2️⃣ Get all submissions for this group
    const submissions = await StudentSubmission.find({ groupID: gid });

    // 3️⃣ Get all automated mark entries for students in this group
    const automatedMarks = await AutomatedMark.find({
      sid: { $in: group.members },
    });

    // 4️⃣ Map members with submission and mark info
    const students = group.members.map((studentID) => {
      const submission = submissions.find((s) => s.studentID === studentID);
      const mark = automatedMarks.find((m) => m.sid === studentID);

      return {
        studentID,
        submitted: !!submission,
        code: submission ? submission.code : null,
        languageType: submission ? submission.languageType : null,
        dateSubmit: submission ? submission.dateSubmit : null,

        // 🔹 Add automated mark info
        evaluated: !!mark, // true if already in AutomatedMark
        remoteRequested: mark?.remotereq?.trim() ? true : false,
      };
    });

    res.json({ gid: group.gid, students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
