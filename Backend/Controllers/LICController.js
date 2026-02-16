const bcrypt = require("bcryptjs");
const LIC = require("../Model/LIC");

const createLIC = async (req, res) => {
  try {
    const { licID, name, email, password, department, contact } = req.body;

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
    res.status(201).json({ message: "LIC created successfully", licID: newLIC.licID });
  } catch (error) {
    console.error("Error creating LIC:", error);
    res.status(500).json({ error: "Failed to create LIC" });
  }
};

module.exports = { createLIC };
