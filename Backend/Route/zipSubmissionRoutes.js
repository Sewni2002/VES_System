const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ZipSubmission = require("../Model/ZipSubmission"); // adjust path if needed

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/zips";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST - Upload ZIP
router.post("/upload", upload.single("zipFile"), async (req, res) => {
  try {
    const { studentID, studentName, groupID, languageType, module } = req.body;

    const newZip = new ZipSubmission({
      studentID,
      studentName,
      groupID,
      languageType,
      module,
      zipFile: req.file.filename,
    });

    await newZip.save();
    res.json({ message: "ZIP submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading ZIP" });
  }
});

// GET - List ZIPs for a student
router.get("/:studentID", async (req, res) => {
  try {
    const zips = await ZipSubmission.find({ studentID: req.params.studentID }).sort({ dateSubmit: -1 });
    res.json(zips);
  } catch (err) {
    res.status(500).json({ message: "Error fetching ZIP submissions" });
  }
});

// DELETE - Remove ZIP
router.delete("/:id", async (req, res) => {
  try {
    const zip = await ZipSubmission.findById(req.params.id);
    if (!zip) return res.status(404).json({ message: "Submission not found" });

    const filePath = path.join("uploads/zips", zip.zipFile);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await ZipSubmission.findByIdAndDelete(req.params.id);
    res.json({ message: "ZIP submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting ZIP submission" });
  }
});

module.exports = router;
