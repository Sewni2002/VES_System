const express = require("express");
const router = express.Router();
const GetInstructorAllocation = require("../Model/GetInstructorAllocation");

router.post("/instructorallocation", async (req, res) => {
  try {
    const allocation = new GetInstructorAllocation(req.body);
    await allocation.save();
    res.status(201).json(allocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
