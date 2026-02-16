const express = require("express");
const router = express.Router();
const Dean = require("../Model/Dean");
const bcrypt = require("bcrypt");

// Add Dean
router.post("/add", async (req, res) => {
  try {
    const { deanID, name, email, password, faculty, contact } = req.body;

    // Check if deanID or email already exists
    const existingDean = await Dean.findOne({ $or: [{ deanID }, { email }] });
    if (existingDean) {
      return res.status(400).json({ message: "Dean ID or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDean = new Dean({
      deanID,
      name,
      email,
      password: hashedPassword,
      faculty,
      contact
    });

    await newDean.save();

    res.json({ message: "Dean added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:deanID", async (req, res) => {
  try {
    const dean = await Dean.findOne({ deanID: req.params.deanID });
    if (!dean) return res.status(404).json({ message: "Dean not found" });
    res.json(dean);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Dean
router.put("/:deanID", async (req, res) => {
  try {
    const { name, email, faculty, contact } = req.body;

    const dean = await Dean.findOne({ deanID: req.params.deanID });
    if (!dean) return res.status(404).json({ message: "Dean not found" });

    // Update fields
    if (name) dean.name = name;
    if (email) dean.email = email;
    if (faculty) dean.faculty = faculty;
    if (contact) dean.contact = contact;

    await dean.save();
    res.json({ message: "Dean updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE Dean by ID
router.delete("/delete/:deanID", async (req, res) => {
  const { deanID } = req.params;

  try {
    const dean = await Dean.findOne({ deanID });
    if (!dean) {
      return res.status(404).json({ message: "Dean not found" });
    }

    await Dean.deleteOne({ deanID });
    res.status(200).json({ message: "Dean deleted successfully" });
  } catch (err) {
    console.error("Error deleting Dean:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
