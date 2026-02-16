const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: String,
  members: [String],
  assignedDate: Date,
  gid: String
});

module.exports = mongoose.model('Group', groupSchema);
