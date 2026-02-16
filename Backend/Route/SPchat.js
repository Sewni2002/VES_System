// Routes/chat.js
const express = require("express");
const router = express.Router();
const {
  getGroupMessages,
  sendMessage,
  deleteMessage,
} = require("../Controllers/SPChatController");

// GET messages for student's group
router.get("/:studentID", getGroupMessages);

// POST message to student's group
router.post("/:studentID", sendMessage);

// DELETE a message
router.delete("/delete/:id", deleteMessage);

module.exports = router;
