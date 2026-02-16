const mongoose = require('mongoose');

// Define sub-schema for members
const memberSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false }); // prevent _id field inside each member

// Define group schema
const groupSchema = new mongoose.Schema({
  groupName: String,
  members: [memberSchema],
  assignedDate: Date,
  assignedLocation: String,
  gid: { type: String, required: true, unique: true }
});

// Export model
module.exports = mongoose.model('groupswpa', groupSchema);
