const express = require("express");
const router = express.Router();
const { submitFeedback, getAllFeedbacks } = require("../Controllers/SPFeedbackController");

// POST: submit feedback
router.post("/submit", submitFeedback);

// GET: get all feedbacks (optional, for admin)
router.get("/all", getAllFeedbacks);

module.exports = router;
