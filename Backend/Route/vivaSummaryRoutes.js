const express = require("express");
const router = express.Router();
const VivaSummary = require("../Model/VivaSummary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// -------------------- MULTER CONFIG --------------------
const uploadFolder = "uploads/";

// Ensure the uploads folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// -------------------- CREATE NEW VIVA --------------------
router.post("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required." });
    }

    const newViva = new VivaSummary({ startDate, endDate });
    const savedViva = await newViva.save();
    res.status(201).json(savedViva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating viva summary." });
  }
});

// -------------------- GET ALL VIVAS --------------------
router.get("/", async (req, res) => {
  try {
    const summaries = await VivaSummary.find().sort({ createdAt: -1 });
    res.json(summaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching viva summaries." });
  }
});

// -------------------- GET VIVA BY ID --------------------
router.get("/:id", async (req, res) => {
  try {
    const summary = await VivaSummary.findById(req.params.id);
    if (!summary) return res.status(404).json({ message: "Viva summary not found." });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching viva summary." });
  }
});

// -------------------- UPLOAD PDF & GENERATE LINK --------------------
router.post("/upload/:id", upload.single("pdf"), async (req, res) => {
  try {
    const viva = await VivaSummary.findById(req.params.id);
    if (!viva) return res.status(404).json({ message: "Viva not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    // Save PDF path
    viva.pdf = req.file.path;

    // Generate share link (frontend route example)
    viva.link = `${req.protocol}://${req.get("host")}/viva/download/${viva._id}`;

    await viva.save();
    res.json(viva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload PDF or generate link" });
  }
});

// -------------------- DOWNLOAD PDF ONLY AFTER END DATE --------------------
router.get("/download/:id", async (req, res) => {
  try {
    const viva = await VivaSummary.findById(req.params.id);
    if (!viva) return res.status(404).json({ message: "Viva not found" });

    const today = new Date();
    if (today < viva.endDate) {
      return res.status(403).json({ message: "PDF not available yet. Wait until after viva end date." });
    }

    res.download(viva.pdf); // send file to client
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to download PDF" });
  }
});

module.exports = router;
