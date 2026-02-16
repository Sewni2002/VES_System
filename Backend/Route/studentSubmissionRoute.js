const express = require("express");
const router = express.Router();
const StudentSubmission = require("../Model/StudentSubmission");
const Scheduler = require("../Model/Scheduler");

// GET submissions
// If ?instructorId is provided → filter by instructor's groups
// Else → return all submissions
router.get("/", async (req, res) => {
  try {
    let submissions;

    if (req.query.instructorId) {
      const { instructorId } = req.query;

      // Step 1: Get all groupIds for this instructor
      const schedulerGroups = await Scheduler.find({ instructorId }).lean();
      const groupIds = schedulerGroups.map((g) => g.groupId);

      // Step 2: Fetch student submissions for these groupIds
      submissions = await StudentSubmission.find({ groupID: { $in: groupIds } })
        .sort({ studentID: 1 })
        .lean();
    } else {
      // No instructorId → return all submissions
      submissions = await StudentSubmission.find().lean();
    }

    // Step 3: fallback studentName if missing
    const submissionsWithNames = submissions.map((sub) => ({
      ...sub,
      studentName: sub.studentName || "Unknown",
    }));

    res.json(submissionsWithNames);
  } catch (err) {
    console.error("Error fetching student submissions:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get submission by studentID (from Task_manage branch)
router.get("/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const submission = await StudentSubmission.findOne({ studentID: sid }).lean();
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;