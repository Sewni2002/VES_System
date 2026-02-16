const express = require('express');
const router = express.Router();
const Group = require('../Model/GroupSWPA');
const Student = require('../Model/StudentGrpSWPA');

// GET today's groups
router.get('/today', async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  try {
    const groups = await Group.find({
      assignedDate: { $gte: startOfDay, $lte: endOfDay }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET group by gid (fallback to student collection if missing)
router.get('/:gid', async (req, res) => {
  try {
    const raw = req.params.gid || "";
    const gid = String(raw).replace(/[{}]/g, "").trim();
    const variants = [gid, `{${gid}}`];

    let group = await Group.findOne({ gid: { $in: variants } });
    if (group) return res.json(group);

    // fallback: synthesize group from StudentGrp
    const students = await Student.find({
      $or: [
        { gid: { $in: variants } },
        { groupID: { $in: variants } }
      ]
    }).lean();

    if (!students.length) return res.status(404).json({ error: "Group not found" });

    const members = students.map(s => ({
      studentID: s.idNumber || s.studentID || "",
      name: s.name || ""
    }));

    const synthetic = {
      gid,
      groupName: students[0].groupName || students[0].name || `Group ${gid}`,
      members,
      assignedLocation: students[0].assignedLocation || "-",
      assignedDate: students[0].assignedDate || null
    };

    return res.json(synthetic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching group" });
  }
});

module.exports = router;
