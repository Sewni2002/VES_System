const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  attemptNumber: { type: Number, required: true },
  questions: [
    {
      questionID: { type: mongoose.Schema.Types.ObjectId, ref: "MCQQuestion" },
      selectedOption: { type: Number },
      correct: { type: Boolean }
    }
  ],
  score: { type: Number },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MockVivaAttempt", AttemptSchema);
