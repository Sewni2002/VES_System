const mongoose = require("mongoose");

const OffenceFeedbackSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  reason: { type: String, required: true }, // reason for offence
  audioPath: { type: String }, // path to uploaded audio
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OffenceFeedback", OffenceFeedbackSchema);
