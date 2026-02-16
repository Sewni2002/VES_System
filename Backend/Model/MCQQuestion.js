const mongoose = require("mongoose");

const MCQQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: Number, required: true },
  topic: { type: String }
});

module.exports = mongoose.model("MCQQuestion", MCQQuestionSchema);
