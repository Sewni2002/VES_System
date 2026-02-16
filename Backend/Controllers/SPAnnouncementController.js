const Announcement = require("../Model/Announcement");

// Get latest 5 announcements
exports.getLatestAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all announcements" });
  }
};

// Add new announcement (admin use)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newAnnouncement = new Announcement({ title, description });
    await newAnnouncement.save();
    res.json(newAnnouncement);
  } catch (err) {
    res.status(500).json({ error: "Failed to create announcement" });
  }
};
