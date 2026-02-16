const express = require("express");
const router = express.Router();
const FullMarks = require("../Model/FullMarks");

// ✅ Get FullMarks record by Student ID
router.get("/fullmarks/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const record = await FullMarks.findOne({ sid });
    if (!record) {
      return res.status(404).json({ message: "FullMarks record not found" });
    }
    res.json(record);
  } catch (error) {
    console.error("Error fetching FullMarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
