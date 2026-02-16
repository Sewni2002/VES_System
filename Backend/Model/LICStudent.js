const mongoose = require("mongoose");

const LICStudentSchema = new mongoose.Schema(
  {
    studentId:  { type: String, required: true, trim: true }, // e.g., SLIIT-IT-00123
    name:       { type: String, required: true, trim: true },
    year:       { type: Number, required: true, min: 1, max: 6 },
    semester:   { type: Number, required: true, enum: [1, 2] },
    moduleCode: { type: String, trim: true }, // optional, per your needs
    groupId:    { type: String, default: null }, // filled after confirm
    currentGPA: { type: Number, default: null },
    isActive:   { type: Boolean, default: true },
    religion: { type: String, required:true }, 
    gender: { type: String, required:true }, 

  },
  { timestamps: true,
    collection: "LIC_student" // exact collection name
  }
);

LICStudentSchema.index({ year: 1, semester: 1 });
LICStudentSchema.index({ studentId: 1, moduleCode: 1 }, { unique: true });

module.exports = mongoose.model("LICStudent", LICStudentSchema);
