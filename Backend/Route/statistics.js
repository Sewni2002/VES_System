const express = require('express');
const mongoose = require('mongoose'); // <--- add this

const router = express.Router();
const FullMarks = require('../Model/FullMarks');
const Attendance = require('../Model/Attendance');
const Student = require('../Model/StudentGrp');
//import students = require('../Model/StudentGrp');

// 1️⃣ Monthly Viva Performance (Line Chart)
router.get('/monthly-vivas', async (req, res) => {
  try {
    const marks = await FullMarks.find();
    const monthlyData = {};

    marks.forEach(m => {
      // Use createdAt if exists, else default to current month
      const month = m.createdAt ? m.createdAt.getMonth() : new Date().getMonth();
      monthlyData[month] = (monthlyData[month] || 0) + m.fullmark;
    });

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data = Object.keys(monthlyData).map(m => ({
      month: monthNames[m],
      vivas: monthlyData[m]
    }));

    res.json(data);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monthly vivas' });
  }
});

// 2️⃣ Marks per Student (Bar Chart)
router.get('/student-marks', async (req, res) => {
  try {
    const marks = await FullMarks.find();
    const data = marks.map(s => ({ student: s.sid, fullmark: s.fullmark }));
    res.json(data);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});

// 3️⃣ Attendance Summary (Pie Chart)
router.get('/attendance-summary', async (req, res) => {
  try {
    const attendance = await Attendance.find();
    const summary = { Present:0, Late:0, Absent:0, Remote:0 };

    attendance.forEach(a => {
      summary[a.status] = (summary[a.status] || 0) + 1;
    });

    const data = Object.keys(summary).map(key => ({
      name: key,
      value: summary[key]
    }));

    res.json(data);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

// 4️⃣ Full Summary Report (JSON)
router.get('/summary-report', async (req, res) => {
  try {
    const students = await mongoose.connection.collection('Student').find().toArray(); // corrected
    const marks = await FullMarks.find();
    const attendance = await Attendance.find();

    const report = students.map(s => {
      const fm = marks.find(f => f.sid === s.idNumber) || {};
      const att = attendance.filter(a => a.studentId === s.idNumber) || [];
      return {
        sid: s.idNumber,
        name: s.name,
        gid: s.gid,
        fullmark: fm.fullmark || 0,
        automatedmarks: fm.automatedmarks || 0,
        manualmarks: fm.manualmarks || 0,
        attendance: att.map(a => ({ status: a.status, sessionId: a.sessionId }))
      };
    });

    res.json(report);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary report' });
  }
});



module.exports = router;
