const express = require("express");
const router = express.Router();
const LIC = require("../Model/LIC");
const multer = require("multer");
const path = require("path");

// 📂 Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/src/assets")); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// ✅ initialize upload
const upload = multer({ storage });

// ✅ Update LIC profile image
router.put("/:licID/upload", upload.single("profileImage"), async (req, res) => {
  try {
    const imagePath = `/uploadslicimage/${req.file.filename}`; // served via app.js
    const lic = await LIC.findOneAndUpdate(
      { licID: req.params.licID },
      { profileImage: imagePath },
      { new: true }
    );
    res.json(lic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get LIC details by licID
router.get("/:licID", async (req, res) => {
  try {
    const lic = await LIC.findOne({ licID: req.params.licID });
    if (!lic) return res.status(404).json({ message: "LIC not found" });
    res.json(lic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update LIC details (name, department, contact)
router.put("/:licID", async (req, res) => {
  try {
    const { name, department, contact } = req.body;
    const lic = await LIC.findOneAndUpdate(
      { licID: req.params.licID },
      { name, department, contact },
      { new: true }
    );
    res.json(lic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
