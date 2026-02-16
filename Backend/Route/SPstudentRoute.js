const express = require("express");
const router = express.Router();
const { getStudentByID, updateStudent } = require("../Controllers/SPStudentController");

// Fetch student
router.get("/student/:studentID", getStudentByID);

// Update student (phone & profile pic)
router.put("/student/:studentID", updateStudent);

module.exports = router;
