const express = require('express');
const router = express.Router();
const Group = require('../Model/Group');

// GET today's groups
router.get('/today', async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);

  try {
    const groups = await Group.find({
      assignedDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/by-gid/:gid", async (req, res) => {
  try {
    const group = await Group.findOne({ gid: req.params.gid });
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




//vindy part
router.get('/getAllgroups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
