const express = require("express");
const multer = require("multer");
const bcrypt = require("bcrypt");

const path = require("path");
const {
  Student,
  Y01_Sem01Stud,
  Y01_Sem02Stud,
  Y02_Sem01Stud,
  Y02_Sem02Stud,
  Y03_Sem01Stud,
  Y03_Sem02Stud,
} = require("../Model/Student");
const LICModule = require("../Model/LICModule");
const LICStudent = require("../Model/LICStudent");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "studentimages/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const semesterModelMap = {
  Y01_Sem01: Y01_Sem01Stud,
  Y01_Sem02: Y01_Sem02Stud,
  Y02_Sem01: Y02_Sem01Stud,
  Y02_Sem02: Y02_Sem02Stud,
  Y03_Sem01: Y03_Sem01Stud,
  Y03_Sem02: Y03_Sem02Stud,
};

// Viva registration route
router.post("/viva-register", upload.single("photo"), async (req, res) => {
  try {
    const { studentID, academicYear, semester, phone, password, religion, gender } = req.body;

    const modelKey = `${academicYear}_${semester}`;
    const SemesterModel = semesterModelMap[modelKey];
    if (!SemesterModel) return res.status(400).send("Invalid academic year or semester selected.");

    // Find the student
    const student = await Student.findOne({ studentID });
    if (!student) return res.status(404).send("Student not found.");

    // Update name/password if provided
    if (req.body.iname) student.iname = req.body.iname;
    if (req.body.fname) student.fname = req.body.fname;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      student.password = hashedPassword;
    }

    await student.save();

    // 🟢 Create record in semester table
    const newEntry = new SemesterModel({
      studentID: student.studentID,
      email: student.email,
      photo: req.file.filename,
      enrolledDate: new Date(),
      groupID: "Default",
      faculty: "Computing",
      payment_status: false,
      phone: phone || "",
      religion: religion || "Not specified",
      gender: gender || "Not specified",
      gpa: student.currentGPA ? parseFloat(student.currentGPA) : 0.0,
    });

    await newEntry.save();

    // 🟢 Also add records to LICStudent table (one per module)
    const year = parseInt(academicYear.replace("Y", ""));
    const sem = parseInt(semester.replace("Sem", ""));

    const modules = await LICModule.find(
      { academicYear: year, semester: sem, isActive: true },
      { moduleId: 1, _id: 0 }
    );

    if (modules.length > 0) {
      const licStudents = modules.map((m) => ({
        studentId: student.studentID,
        name: `${student.iname || ""} ${student.fname || ""}`.trim(),
        year,
        semester: sem,
        moduleCode: m.moduleId,
        groupId: "Default",
        currentGPA: student.currentGPA ? parseFloat(student.currentGPA) : 0.0,
        isActive: true,
        religion: religion || "Not specified",
      gender: gender || "Not specified",

      }));

      await LICStudent.insertMany(licStudents);
    }

    return res.status(200).send("Student registered for viva and LIC modules successfully.");
  } catch (err) {
    console.error("Viva Registration Error:", err);
    return res.status(500).send("Server error during viva registration.");
  }
});

// Update payment status route
const { sendOrderSuccessMsg } = require("../Util/whatsAppSender");

// Update payment status route
router.post("/update-payment-status", async (req, res) => {



  console.log("📩 Incoming body:", req.body);  // <---

  const { studentID, academicYear, semester } = req.body;
  const modelKey = `${academicYear}_${semester}`;
  const SemesterModel = semesterModelMap[modelKey];
  if (!SemesterModel) return res.status(400).send("Invalid semester model");

  try {
    // Update payment_status in semester model
    const updated = await SemesterModel.updateOne(
      { studentID },
      { $set: { payment_status: true } }
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).send("Student not found in selected semester");
    }

    // Now update vivaregstatus in main Student collection
    const student = await Student.findOne({ studentID });
    if (!student) return res.status(404).send("Student not found in main Student DB");

    student.vivaregstatus = true;
    await student.save();

    //get the phone number to sent whatsapp message
    const semesterRecord = await SemesterModel.findOne({ studentID });
if (!semesterRecord) {
  return res.status(404).send("Student not found in semester model");
}

const phoneNumber = semesterRecord.phone;

//calling sent whatsapp
       const whatsappResult = await sendOrderSuccessMsg(phoneNumber, studentID);
    console.log("WhatsApp Result:", whatsappResult);

    res.send("Payment status and viva registration status updated");
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).send("Failed to update payment and viva registration status");
  }
});

module.exports = router;
