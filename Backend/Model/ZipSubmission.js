const mongoose = require("mongoose");

const zipSubmissionSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String },
  groupID: { type: String },
  module: { type: String, required: true },
  languageType: { type: String },
  zipFile: { type: String, required: true }, // 🔹 File name or path
  dateSubmit: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ZipSubmission", zipSubmissionSchema);
