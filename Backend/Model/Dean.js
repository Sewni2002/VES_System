// 📁 Model/Dean.js
const mongoose = require("mongoose");

const deanSchema = new mongoose.Schema({
  deanID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faculty: { type: String },
  contact: { type: String }
});

const Dean = mongoose.model("deandb", deanSchema);
module.exports = Dean;
