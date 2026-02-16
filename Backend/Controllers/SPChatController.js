// Controllers/ChatController.js
const GroupChat = require("../Model/GroupChat");
const Student = require("../Model/StudentGrpSWPA");

const getGroupMessages = async (req, res) => {
  try {
    const studentID = req.params.studentID;

    // Find student's group
    const student = await Student.findOne({
      $or: [{ studentID }, { idNumber: studentID }],
    });
    if (!student || !student.gid)
      return res.status(404).json({ error: "No group assigned" });

    const messages = await GroupChat.find({ groupID: student.gid }).sort({
      createdAt: 1,
    });
    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const studentID = req.params.studentID;
    const { message, file, fileName } = req.body;

    const student = await Student.findOne({
      $or: [{ studentID }, { idNumber: studentID }],
    });
    if (!student || !student.gid)
      return res.status(404).json({ error: "No group assigned" });

    const chat = new GroupChat({
      groupID: student.gid,
      senderID: student.studentID || student.idNumber,
      senderName: student.iname || student.name,
      message: message || "",
      file: file || "",
      fileName: fileName || "",
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await GroupChat.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Message not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getGroupMessages, sendMessage, deleteMessage };
