const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  studentID: { type: String, required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, required: true },
  questions: { type: String }, // any extra questions answered
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
