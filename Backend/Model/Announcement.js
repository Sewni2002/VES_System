const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
