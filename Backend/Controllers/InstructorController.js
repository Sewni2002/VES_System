const Instructor = require("../Model/Instructor");
const bcrypt = require("bcryptjs");

// Create instructor controller function
const createInstructor = async (req, res) => {
  try {
    const { instructorID, name, email, password, department, contact } = req.body;

    // Check if instructor already exists
    const existing = await Instructor.findOne({ instructorID });
    if (existing) {
      return res.status(400).json({ error: "Instructor already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newInstructor = new Instructor({
      instructorID,
      name,
      email,
      password: hashedPassword,
      department,
      contact,
    });

    await newInstructor.save();

    res.status(201).json({ message: "Instructor created successfully" });
  } catch (error) {
    console.error("Error creating instructor:", error);
    res.status(500).json({ error: "Server error" });
  }
};



//vindy
const getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().select("-password"); 
    res.status(200).json(instructors);
  } catch (error) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = { createInstructor ,getAllInstructors };
