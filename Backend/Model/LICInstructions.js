const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema(
  {
    label: String,
    url: String,
  },
  { _id: false }
);

const InstructionSchema = new mongoose.Schema(
  {
    instructionId: { type: String },

    year: { type: Number, required: true, min: 1, max: 6 },
    moduleCode: { type: String, required: true },

    context: { type: String, required: true }, // title
    details: { type: String },                 // long text (optional)

    attachments: [AttachmentSchema],           // [{label,url}]
    createdBy: { type: String },
  },
  { timestamps: true }
);

InstructionSchema.index({ year: 1, moduleCode: 1, createdAt: -1 });

module.exports = mongoose.model("Instruction", InstructionSchema);
