const mongoose = require("mongoose");

const LICTopicSchema = new mongoose.Schema(
  {
    topicId:    { type: String, required: true, unique: true, trim: true }, // e.g., "TP001"
    name:       { type: String, required: true, trim: true },               // e.g., "E-Commerce Platform"
    year:       { type: Number, required: true, min: 1, max: 6 },
    semester:   { type: Number, required: true, enum: [1, 2] },
    moduleCode: { type: String, required: true, trim: true },
    tags:       [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Helpful indexes
LICTopicSchema.index({ year: 1, semester: 1, moduleCode: 1 });
LICTopicSchema.index({ topicId: 1 }, { unique: true });

module.exports = mongoose.model("LICTopic", LICTopicSchema);
