const bcrypt = require("bcryptjs");
const { Student } = require("../Model/Student");

const generateStudentID = async () => {
  const year = new Date().getFullYear().toString().slice(-2); // last 2 digits of year
  let studentID;
  let exists = true;

  while (exists) {
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    studentID = `SID${year}${randomNumber}`;

    // Check if this ID already exists
    exists = await Student.findOne({ studentID });
  }

  return studentID;
};


//just for implementation purposes
const registerStudent = async (req, res) => {
  const {
    iname,
    fname,
    email,
    password,
    address,
    vivaregstatus,
    academic_status,
  } = req.body;

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentID = await generateStudentID(); // Generate unique ID

    const newStudent = new Student({
      iname,
      fname,
      studentID, 
      email,
      password: hashedPassword,
      address,
      vivaregstatus,
      academic_status,
    });

    await newStudent.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//for login page
const loginStudent = async (req, res) => {
  const { studentID, password } = req.body;

  try {
    const student = await Student.findOne({ studentID });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    
    res.status(200).json({
      message: "Login successful",
      studentID: student.studentID,
      name: student.iname,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// Controller to fetch student by ID
const getStudentByID = async (req, res) => {
  try {
    console.log("Looking for student:", req.params.studentID);

    const student = await Student.findOne({ studentID: req.params.studentID });

    if (!student) {
      console.log("Student NOT FOUND in DB");
      return res.status(404).send("Student not found.");
    }

    console.log("Student found:", student);
    res.json(student);
  } catch (err) {
    console.error("Error retrieving student:", err);
    res.status(500).send("Error retrieving student.");
  }
};



module.exports = { registerStudent, loginStudent, getStudentByID };

