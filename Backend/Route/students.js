const express = require('express');
const router = express.Router();
const Student = require('../Model/StudentGrp');

const { getStudentByID } = require("../Controllers/StudentController");

router.get("/student/:studentID", getStudentByID);



// GET students by gid
router.get('/by-gid/:gid', async (req, res) => {
  try {
    const gid = req.params.gid;
    console.log("Requested GID:", gid);  // <-- log requested gid
    // Find students with matching gid
    const students = await Student.find({ gid });
    console.log("Matched Students:", students);  // <-- log fetched students
    res.json(students);
  } catch (err) {
    console.error('Error fetching students by gid:', err);
    res.status(500).json({ error: 'Server error fetching students' });
  }
});

router.get("/by-sid/:sid", async (req, res) => {
  try {
    const student = await Student.findOne({ idNumber: req.params.sid });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post('/by-ids', async (req, res) => {
  try {
    const { ids } = req.body; // array of idNumbers
    const students = await Student.find({ idNumber: { $in: ids } });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
