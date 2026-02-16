const mongoose = require("mongoose");

const CorrectAnswerSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  groupId: { type: String, required: true },
  questionId: { type: String, required: true },
  correctAnswer: { type: String, required: true }, // "A", "B", etc.
});

module.exports = mongoose.model("CorrectAnswer", CorrectAnswerSchema);
