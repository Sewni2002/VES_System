const express = require("express");
const router = express.Router();
const AutomatedMarks = require("../Model/AutomatedMarks");

// GET marks by SID
router.get("/by-sid/:sid", async (req, res) => {
  try {
    // Find by SID in DB
    const marks = await AutomatedMarks.findOne({ sid: req.params.sid });

    // If not found, return default zero values
    if (!marks) {
      return res.json({
        easyCount: 0,
        interCount: 0,
        advancedCount: 0,
        attempt: false,
      });
    }

    // Send actual marks
    res.json(marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new marks (for testing or adding marks)
router.post("/add", async (req, res) => {
  try {
    const { sid, easyCount, interCount, advancedCount, attempt } = req.body;

    // Check if marks already exist
    let marks = await AutomatedMarks.findOne({ sid });
    if (marks) {
      // Update existing
      marks.easyCount = easyCount;
      marks.interCount = interCount;
      marks.advancedCount = advancedCount;
      marks.attempt = attempt;
      await marks.save();
      return res.status(200).json(marks);
    }

    // Create new
    const newMarks = new AutomatedMarks({
      sid,
      easyCount,
      interCount,
      advancedCount,
      attempt,
    });

    await newMarks.save();
    res.status(201).json(newMarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
