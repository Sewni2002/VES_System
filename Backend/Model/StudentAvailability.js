const mongoose = require('mongoose');

const StudentAvailabilitySchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupName: { type: String, required: true },
  weekStartDate: { type: Date, required: true },
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    timeSlots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentAvailability', StudentAvailabilitySchema);