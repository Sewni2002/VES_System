const mongoose = require("mongoose");

const ZipMetaSchema = new mongoose.Schema({
  originalName: String,
  storagePath: String,
  mimeType: String,
  size: Number,
});

const submissionSchema = new mongoose.Schema({
  groupID: { type: String, required: true, index: true },
  groupObjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  studentID: { type: String, required: true },
  studentName: { type: String },
  role: { type: String, enum: ["leader", "member"], default: "member" },
  type: { type: String, default:"text"},
  languageType: { type: String },
  scope: { type: String },
  notes: { type: String },
  code: { type: String },
  zip: ZipMetaSchema,
  moduleCode: { type: String, index: true, default: null },
  dateSubmit: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  questionGenerate: { type: Boolean, default: false },
});

submissionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.StudentSubmission || mongoose.model("StudentSubmission", submissionSchema);
