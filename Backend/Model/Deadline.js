const mongoose = require("mongoose");

const DeadlineSchema = new mongoose.Schema(
  {
    deadlineId: { type: String },

    // NEW: type field so controller can filter deadlines by purpose (e.g. "submission")
    type: { type: String, required: true, default: "submission" },

    year: { type: Number, required: true, min: 1, max: 6 },
    moduleCode: { type: String, required: true },

    context: { type: String, required: true },
    details: { type: String },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    createdBy: { type: String }, // LIC user id / email (optional)
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// helpful index for filtering
DeadlineSchema.index({ type: 1, year: 1, moduleCode: 1, endDate: 1 });

module.exports =
  mongoose.models.Deadline || mongoose.model("Deadline", deadlineSchema);
