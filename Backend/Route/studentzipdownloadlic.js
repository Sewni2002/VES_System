// routes/zipSubmissionRoutes.js
const express = require("express");
const router = express.Router();
const ZipSubmission = require("../Model/ZipSubmission");

router.get("/:studentID", async (req, res) => {
  try {
    const { studentID } = req.params;
    const submission = await ZipSubmission.findOne({ studentID });
    if (!submission) return res.status(404).json(null);

    res.json({
      studentID: submission.studentID,
      studentName: submission.studentName,
      zipFile: submission.zipFile, // storagePath in your object
      zipFileOriginal: submission.originalName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
