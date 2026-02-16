// Model/GroupChat.js
const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  groupID: { type: String, required: true }, // e.g., G001
  senderID: { type: String, required: true },
  senderName: { type: String, required: true },
  message: { type: String, default: "" },
  file: { type: String, default: "" }, // base64 data
  fileName: { type: String, default: "" }, // ✅ store file name
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GroupChat", chatMessageSchema);
