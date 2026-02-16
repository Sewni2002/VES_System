const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  instructorID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  contact: { type: String }
});

const Instructor = mongoose.model("instructordb", instructorSchema);

module.exports = Instructor;
