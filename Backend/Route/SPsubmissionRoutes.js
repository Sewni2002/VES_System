const express = require("express");
const router = express.Router();
const {
  createTextSubmission,
  createZipSubmission,
  getGroupSubmissions,
  editSubmission,
  getSubmissionsByStudent,
  deleteSubmission,
  getDeadline,
  upload,
} = require("../Controllers/SPsubmissionController");

// Text
router.post("/text/:studentID", createTextSubmission);

// ZIP
router.post("/zip", upload.array("zipfile"), createZipSubmission);

// Group submissions
router.get("/group/:gid", getGroupSubmissions);

// Deadline
router.get("/deadline", getDeadline);

router.get("/student/:studentID", getSubmissionsByStudent);


// Edit / Delete
router.put("/:id", editSubmission);
router.delete("/:id", deleteSubmission);

module.exports = router;
