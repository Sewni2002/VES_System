// routes/studentSubmissionRoutes.js
const express = require("express");
const axios = require("axios");
const StudentSubmission = require("../Model/StudentSubmission");

const router = express.Router();

// ✅ Add a new student submission
router.post("/add", async (req, res) => {
  try {
    const { studentID, code, languageType, module } = req.body;

    if (!studentID || !code || !languageType || !module) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check for duplicate submission (same student + module)
    const existing = await StudentSubmission.findOne({ studentID, module });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already submitted for this module." });
    }

    // ✅ Get student details
    const studentRes = await axios.get(
      `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
    );
    const studentData = studentRes.data;

    const studentName = `${studentData.iname} ${studentData.fname}`;

    // ✅ Get group ID
    const groupRes = await axios.get(
      `http://localhost:5000/api/SPstudentGroup/group-by-student/${studentID}`
    );

    const groupID = groupRes.data?.group?.gid || "-";

    // ✅ Save submission
    const newSubmission = new StudentSubmission({
      studentID,
      studentName,
      groupID,
      code,
      languageType,
      module,
    });

    await newSubmission.save();

    res.status(201).json({
      message: "Submission added successfully!",
      submission: newSubmission,
    });
  } catch (error) {
    console.error("Error adding submission:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Get all submissions
router.get("/", async (req, res) => {
  try {
    const submissions = await StudentSubmission.find().sort({ dateSubmit: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// ✅ Update submission
router.put("/update/:id", async (req, res) => {
  try {
    const { code, languageType, module } = req.body;
    const updated = await StudentSubmission.findByIdAndUpdate(
      req.params.id,
      { code, languageType, module },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission updated", updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating submission" });
  }
});

// ✅ Delete submission
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await StudentSubmission.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Submission not found" });
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting submission" });
  }
});

module.exports = router;
