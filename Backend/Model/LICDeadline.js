const mongoose = require("mongoose");

const DeadlineSchema = new mongoose.Schema(
  {
    deadlineId: { type: String },

    year: { type: Number, required: true, min: 1, max: 6 },
    moduleCode: { type: String, required: true },

    context: { type: String, required: true },    
    details: { type: String },                       

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    createdBy: { type: String },                     // LIC user id / email (optional)
  },
  { timestamps: true } // adds createdAt, updatedAt
);

// helpful index for filtering
DeadlineSchema.index({ year: 1, moduleCode: 1, endDate: 1 });

module.exports = mongoose.model("Deadline", DeadlineSchema);
