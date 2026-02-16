const express = require("express");
const router = express.Router();
const Attendance = require("../Model/Attendance");

// GET attendance by student ID
router.get("/by-sid/:sid", async (req, res) => {
  try {
    const record = await Attendance.findOne({ studentId: req.params.sid });
    res.json(record || { status: "Not marked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark attendance
router.post("/mark", async (req, res) => {
  try {
    const { studentId, status } = req.body;
    let record = await Attendance.findOne({ studentId });
    if (!record) {
      record = new Attendance({ studentId, status });
    } else {
      record.status = status;
    }
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
