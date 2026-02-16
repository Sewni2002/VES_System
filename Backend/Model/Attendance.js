const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheduler' },
  studentId: String,
  status: String // Present, Late, Absent
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
