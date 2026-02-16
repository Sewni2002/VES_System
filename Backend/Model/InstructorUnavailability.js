const mongoose = require('mongoose');

const InstructorUnavailabilitySchema = new mongoose.Schema({
  instructorId: String,
  fromDate: Date,
  toDate: Date,
  reason: String
});

module.exports = mongoose.model('InstructorUnavailability', InstructorUnavailabilitySchema);
