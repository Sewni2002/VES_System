// 📁 Controllers/DeanController.js
const Dean = require("../Model/Dean");
const bcrypt = require("bcryptjs");

const createDean = async (req, res) => {
  try {
    const { deanID, name, email, password, faculty, contact } = req.body;
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
    res.status(201).json({ message: "Dean created successfully" });
  } catch (error) {
    console.error("❌ Error creating Dean:", error);
    res.status(500).json({ error: "Failed to create dean" });
  }
};

module.exports = { createDean };
