const bcrypt = require("bcryptjs");
const Student = require("../Model/Student");
const Instructor = require("../Model/Instructor");
const Dean = require("../Model/Dean");
const LIC = require("../Model/LIC");
const {
  Y01_Sem01Stud,
  Y01_Sem02Stud,
  Y02_Sem01Stud,
  Y02_Sem02Stud,
  Y03_Sem01Stud,
  Y03_Sem02Stud
} = require("../Model/Student"); // Semester models included
const { sendOTPViaWhatsApp, verifyOTP } = require("../Util/whatsAppOtpSender");

// Utility to check all user types
const findUserByEmail = async (email) => {
  // Check Dean, Instructor, LIC (contact)
  const models = { Dean, Instructor, LIC };
  for (const [type, Model] of Object.entries(models)) {
    const user = await Model.findOne({ email });
    if (user) return { user, type, phone: user.contact };
  }

  // Check studentdb (common students)
  const student = await Student.findOne({ email });
  if (student) {
    // Try to get studentID to lookup semester phone
    const sid = student.studentID;

    const semModels = [
      Y01_Sem01Stud, Y01_Sem02Stud,
      Y02_Sem01Stud, Y02_Sem02Stud,
      Y03_Sem01Stud, Y03_Sem02Stud
    ];

    for (const model of semModels) {
      const semStudent = await model.findOne({ studentID: sid });
      if (semStudent) {
        return {
          user: student,
          type: "Student",
          phone: semStudent.phone
        };
      }
    }
  }

  return null;
};

// ✅ Send OTP
const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const found = await findUserByEmail(email);

    if (!found) return res.status(404).json({ message: "User not found" });

    const result = await sendOTPViaWhatsApp(found.phone);

    if (result.success) {
      return res.status(200).json({ message: "OTP sent to WhatsApp" });
    } else {
      return res.status(500).json({ message: "Failed to send OTP", error: result.error });
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Verify OTP
const handleVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const found = await findUserByEmail(email);

    if (!found) return res.status(404).json({ message: "User not found" });

    const isValid = verifyOTP(found.phone, otp);

    if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset Password
const handleResetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const found = await findUserByEmail(email);

    if (!found) return res.status(404).json({ message: "User not found" });

    const hash = await bcrypt.hash(newPassword, 10);
    const { user, type } = found;

    let model;
    if (type === "Student") model = Student;
    else if (type === "Instructor") model = Instructor;
    else if (type === "Dean") model = Dean;
    else if (type === "LIC") model = LIC;

    await model.updateOne({ email }, { password: hash });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword,
};
