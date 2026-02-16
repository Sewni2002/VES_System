// routes/announcementRoute.js
const express = require("express");
const router = express.Router();
const Announcement = require("../Model/Announcement");

// Create Announcement
router.post("/announcement", async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const announcement = new Announcement({ title, description });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all announcements (optional)
router.get("/announcement", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
