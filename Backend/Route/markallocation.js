// routes/markallocation.js
const express = require("express");
const router = express.Router();
const MarkAllocation = require("../Model/LICMarkAllocation");

// Fetch mark allocation for year 1
router.get("/year/:year", async (req, res) => {
  try {
    const { year } = req.params;
    const allocation = await MarkAllocation.findOne({ year: Number(year) });
    if (!allocation) return res.status(404).json({ message: "No allocation found for this year" });
    res.json(allocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
