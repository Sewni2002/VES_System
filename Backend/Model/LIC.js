const mongoose = require("mongoose");

const licSchema = new mongoose.Schema({
  licID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  contact: { type: String },
  profileImage: {
    type: String,
    default: "/uploads/lic-default.png" // path to default image
  }
});

const LIC = mongoose.model("licdb", licSchema);

module.exports = LIC;
