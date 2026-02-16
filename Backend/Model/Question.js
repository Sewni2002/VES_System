const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  groupId: { type: String, required: true },
  questionId: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  options: { type: [String], required: true }, // 5 options
});

module.exports = mongoose.model("Question", QuestionSchema);
