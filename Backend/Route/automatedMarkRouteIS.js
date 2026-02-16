const express = require("express");
const router = express.Router();
const AutomatedMark = require("../Model/AutomatedMarkIS");

// Save or update automated mark
router.post("/save", async (req, res) => {
  const { sid, easyCount, interCount, advancedCount, attempt } = req.body;

  if (!sid) return res.status(400).json({ success: false, message: "Student ID required" });

  try {
    // Create new document if it doesn't exist, otherwise update
    const updated = await AutomatedMark.findOneAndUpdate(
      { sid },
      { easyCount, interCount, advancedCount, attempt },
      { upsert: true, new: true } // create if not exists
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error saving automated mark:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Optional: mark attempt manually
router.post("/mark-attempt/:sid", async (req, res) => {
  const { sid } = req.params;

  try {
    const updated = await AutomatedMark.findOneAndUpdate(
      { sid },
      { attempt: true },
      { upsert: true, new: true } // ensure document exists
    );
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error marking attempt:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});




// GET all students with attempt status
router.get("/attempt-status", async (req, res) => {
  try {
    const marks = await AutomatedMark.find({}, "sid attempt"); // get student ID and attempt
    const attemptStatus = {};
    marks.forEach((m) => {
      attemptStatus[m.sid] = m.attempt;
    });
    res.json({ success: true, attemptStatus });
  } catch (err) {
    console.error("Error fetching attempt status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
