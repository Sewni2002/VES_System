const bcrypt = require("bcryptjs");
const { Student } = require("../Model/Student");
const Instructor = require("../Model/Instructor");
const LIC = require("../Model/LIC");
const Dean = require("../Model/Dean");
const Admin = require("../Model/Admin"); // ✅ Import Admin model

const loginUser = async (req, res) => {
  const { studentID, password } = req.body;

  try {
    console.log("🔍 Login attempt:", studentID, password);

    // 1. Student
    let user = await Student.findOne({ studentID });
    if (user) {
      console.log("✅ Student found:", user.studentID);
      const match = await bcrypt.compare(password, user.password);
      console.log("🔐 Password match (student):", match);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      return res.status(200).json({
        message: "Student login successful",
        studentID: user.studentID,
        role: "student",
        status: user.vivaregstatus,
      });
    }

    // 2. Instructor
    user = await Instructor.findOne({ instructorID: studentID });
    if (user) {
      console.log("✅ Instructor found:", user.instructorID);
      const match = await bcrypt.compare(password, user.password);
      console.log("🔐 Password match (instructor):", match);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      return res.status(200).json({
        message: "Instructor login successful",
        instructorID: user.instructorID,
        role: "instructor",
      });
    }

    // 3. LIC
    user = await LIC.findOne({ licID: studentID });
    if (user) {
      console.log("✅ LIC found:", user.licID);
      const match = await bcrypt.compare(password, user.password);
      console.log("🔐 Password match (LIC):", match);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      return res.status(200).json({
        message: "LIC login successful",
        licID: user.licID,
        role: "lic",
      });
    }

    // 4. Dean
    user = await Dean.findOne({ deanID: studentID });
    if (user) {
      console.log("✅ Dean found:", user.deanID);
      const match = await bcrypt.compare(password, user.password);
      console.log("🔐 Password match (Dean):", match);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      return res.status(200).json({
        message: "Dean login successful",
        deanID: user.deanID,
        role: "dean",
      });
    }

    // 5. Admin
    user = await Admin.findOne({ adminID: studentID });
    if (user) {
      console.log("✅ Admin found:", user.adminID);
      const match = await bcrypt.compare(password, user.password);
      console.log("🔐 Password match (Admin):", match);
      if (!match) return res.status(401).json({ error: "Invalid password" });

      return res.status(200).json({
        message: "Admin login successful",
        adminID: user.adminID,
        role: "admin",
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: user.phone,
      });
    }

    // If no user found
    console.log("❌ User not found");
    return res.status(404).json({ error: "User not found" });

  } catch (err) {
    console.error("🚨 Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { loginUser };
