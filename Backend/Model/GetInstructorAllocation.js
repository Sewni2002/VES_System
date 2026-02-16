// 📁 Model/GetInstructorAllocation.js
const mongoose = require("mongoose");

const instructorAllocationSchema = new mongoose.Schema({
  sessionid: { type: String, required: true },
  instructorid: { type: String, required: true },
  groupid: { type: String, required: true }
  // No timestamps
});

const GetInstructorAllocation = mongoose.model(
  "Instructorallocation",
  instructorAllocationSchema
);

module.exports = GetInstructorAllocation;
