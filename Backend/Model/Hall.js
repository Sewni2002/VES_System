const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  booked: { type: Boolean, default: false }
});

const HallSchema = new mongoose.Schema({
  hallNumber: { 
    type: String, 
    required: true,
    unique: true
  },
  slots: [SlotSchema],
  availability: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true,
    set: function(v) {
      this.availability = v;  // Keep availability in sync with isActive
      return v;
    }
  }
});

module.exports = mongoose.model('Hall', HallSchema);
