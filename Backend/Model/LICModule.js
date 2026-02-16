const mongoose = require("mongoose");

const LICModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true, unique: true, trim: true },
    moduleName: { type: String, required: true, trim: true },
    academicYear: { type: Number, required: true, min: 1, max: 6 },
    semester: { type: Number, required: true, enum: [1, 2] },
    credits: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "module" }
);

module.exports = mongoose.model("LICModule", LICModuleSchema);
