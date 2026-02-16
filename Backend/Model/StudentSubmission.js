const mongoose = require("mongoose");

const studentSubmissionSchema = new mongoose.Schema({
  studentID: { type: String, required: true },
  studentName: { type: String },
  groupID: { type: String },
  code: { type: String },
  languageType: { type: String },
  dateSubmit: { type: Date, default: Date.now },
  questionGenerate: { type: Boolean, default: false }, // ✅ Added
  module:{type:String , required:true}

});

module.exports = mongoose.model("StudentSubmission", studentSubmissionSchema);
