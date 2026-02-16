const mongoose = require("mongoose");

const ChecklistItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const ChecklistSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  items: [ChecklistItemSchema]
});

module.exports = mongoose.model("Checklist", ChecklistSchema);
