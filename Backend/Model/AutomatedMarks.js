const mongoose = require('mongoose');

const automatedMarksSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true
  },
  easyCount: {
    type: Number,
    default: 0
  },
  interCount: {
    type: Number,
    default: 0
  },
  advancedCount: {
    type: Number,
    default: 0
  },
  attempt: {
    type: Boolean,
    default: false
  },

  remotereq: {
    type: String,   
    default: ""     
  }
});

module.exports = mongoose.model('AutomatedMarks', automatedMarksSchema);
