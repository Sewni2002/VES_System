const express = require('express');
const router = express.Router();
const Student = require('../Model/StudentGrpSWPA');

function normalize(s) {
  return !s && s !== 0 ? "" : String(s).replace(/[{}]/g, "").trim();
}

// GET students by gid
router.get('/by-gid/:gid', async (req, res) => {
  try {
    const raw = req.params.gid || "";
    const gid = normalize(raw);
    const variants = [gid, `{${gid}}`];

    const students = await Student.find({
      $or: [
        { gid: { $in: variants } },
        { groupID: { $in: variants } },
        { groupId: { $in: variants } }
      ]
    });

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching students' });
  }
});

module.exports = router;
