const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  idNumber: String,
  name: String,
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupsSWPA' },
  topic: String,
  gid: String,
  members: [
    {
      studentID: { type: String, required: true },
      name: { type: String, required: true }
    }
  ],
  assignedLocation: String,

  // NEW: member roles array
  memberRoles: [
    {
      studentID: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: "" } // Leader, Member, etc.
    }
  ]
});

module.exports = mongoose.model('StudentSWPA', studentSchema);
