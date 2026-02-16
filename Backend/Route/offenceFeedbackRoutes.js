

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const OffenceFeedback = require("../Model/OffenceFeedback");

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/offences");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio/")) {
    cb(null, true);
  } else {
    console.log("Rejected file MIME:", file.mimetype);
    cb(new Error("Only audio files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

// --- Create feedback ---
router.post("/", upload.single("audio"), async (req, res) => {
  const { studentId, reason } = req.body;
  if (!studentId || !reason)
    return res.status(400).json({ error: "All fields required" });

  try {
    const feedback = new OffenceFeedback({
      studentId,
      reason,
      audioPath: req.file ? req.file.path : null,
    });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Get all feedback ---
router.get("/", async (req, res) => {
  try {
    const allFeedback = await OffenceFeedback.find().sort({ createdAt: -1 });
    res.json(allFeedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Update feedback by studentId ---
router.put("/by-student/:studentId", upload.single("audio"), async (req, res) => {
  const { reason } = req.body;
  try {
    const feedback = await OffenceFeedback.findOne({ studentId: req.params.studentId });
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });

    if (reason) feedback.reason = reason;
    if (req.file) feedback.audioPath = req.file.path;

    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Delete feedback by _id ---
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await OffenceFeedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

