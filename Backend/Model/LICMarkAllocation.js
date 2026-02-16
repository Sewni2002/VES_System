// Backend/Model/LICMarkAllocation.js
const mongoose = require("mongoose");

const CriteriaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    weight: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const MarkAllocationSchema = new mongoose.Schema(
  {
    year:       { type: Number, required: true, min: 1, max: 6 },
    moduleCode: { type: String, required: true },
    context:    { type: String, required: true },      // title
    totalMarks: { type: Number, required: true, min: 1 },
    criteria:   { type: [CriteriaSchema], required: true }, // e.g. Easy/Intermediate/Hard
    createdBy:  { type: String },                       // optional: email/user id
  },
  { timestamps: true, collection: "mark_allocation" }   // <-- your collection name
);

// helpful filters
MarkAllocationSchema.index({ year: 1, moduleCode: 1, createdAt: -1 });

// idempotent export to avoid OverwriteModelError with nodemon
module.exports =
  mongoose.models.MarkAllocation ||
  mongoose.model("MarkAllocation", MarkAllocationSchema);
