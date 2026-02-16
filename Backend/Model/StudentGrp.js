const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  idNumber: String,
  name: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'groups' },
  topic: String,
  gid: String
  // Add any other fields you need
});

module.exports = mongoose.model('Student', studentSchema, 'Student');
