const mongoose = require('mongoose');

const fullMarksSchema = new mongoose.Schema({
  sid: { type: String, required: true },
  gid: { type: String, required: true },
  automatedmarks: { type: Number, default: 0 },
  manualmarks: { type: Number, default: 0 },
  fullmark: { type: Number, default: 0 },
  link: { type: String, default: '' } ,
  resultLink: { type: String, default: '' },
  qrCode: { type: String, default: '' }, 
});

module.exports = mongoose.model('FullMarks', fullMarksSchema);
