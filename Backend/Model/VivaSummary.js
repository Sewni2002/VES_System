const mongoose = require("mongoose");

const vivaSummarySchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  link: {
    type: String, // URL to viva resources
    default: ""
  },
  pdf: {
    type: String, // file path or URL
    default: ""
  },
}, { timestamps: true });

module.exports = mongoose.model("VivaSummary", vivaSummarySchema);
