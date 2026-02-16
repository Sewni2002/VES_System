const express = require("express");
const router = express.Router();
const Instruction = require("../Model/LICInstructions");

// GET all instructions (optionally filter by year/module)
router.get("/", async (req, res) => {
  try {
    const { year, moduleCode } = req.query;
    const filter = {};
    if (year) filter.year = year;
    if (moduleCode) filter.moduleCode = moduleCode;

    const instructions = await Instruction.find(filter)
      .sort({ createdAt: -1 }) // latest first
      .lean();

    res.json({ success: true, data: instructions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET a single instruction by instructionId
router.get("/:instructionId", async (req, res) => {
  try {
    const instruction = await Instruction.findOne({ instructionId: req.params.instructionId });
    if (!instruction) return res.status(404).json({ success: false, message: "Instruction not found" });
    res.json({ success: true, data: instruction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
