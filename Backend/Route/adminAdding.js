const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../Model/Admin");

// Add Admin
router.post("/add-admin", async (req, res) => {
  try {
    const { adminID, firstname, lastname, email, phone, password } = req.body;

    const existingAdmin = await Admin.findOne({ $or: [{ adminID }, { email }] });
    if (existingAdmin) return res.status(400).json({ message: "AdminID or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ adminID, firstname, lastname, email, phone, password: hashedPassword });

    await newAdmin.save();
    res.status(201).json({ message: "Admin added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
