const express = require("express");
const router = express.Router();
const LIC = require("../Model/LIC");
const bcrypt = require("bcrypt");

// Route to add LIC
router.post("/add", async (req, res) => {
  try {
    const { licID, name, email, password, department, contact } = req.body;

    // Check if LIC already exists
    const existingLIC = await LIC.findOne({ $or: [{ licID }, { email }] });
    if (existingLIC) {
      return res.status(400).json({ message: "LIC ID or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newLIC = new LIC({
      licID,
      name,
      email,
      password: hashedPassword,
      department,
      contact
    });

    await newLIC.save();

    res.json({ message: "LIC added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/:licID", async (req, res) => {
  try {
    const lic = await LIC.findOne({ licID: req.params.licID });
    if (!lic) return res.status(404).json({ message: "LIC not found" });
    res.json(lic);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update LIC
router.put("/:licID", async (req, res) => {
  try {
    const { name, email,  department, contact } = req.body;

    const lic = await LIC.findOne({ licID: req.params.licID });
    if (!lic) return res.status(404).json({ message: "LIC not found" });

    // Update fields
    if (name) lic.name = name;
    if (email) lic.email = email;
    if (department) lic.department = department;
    if (contact) lic.contact = contact;

    await lic.save();
    res.json({ message: "LIC updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/delete/:licID", async (req, res) => {
  const { licID } = req.params;

  try {
    const deletedLIC = await LIC.findOneAndDelete({ licID });

    if (!deletedLIC) {
      return res.status(404).json({ message: "LIC not found" });
    }

    res.status(200).json({ message: "LIC deleted successfully" });
  } catch (err) {
    console.error("Error deleting LIC:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
