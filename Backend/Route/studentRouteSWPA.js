const express = require("express");
const router = express.Router();
const { getStudentByID, updateStudent } = require("../Controllers/StudentControllerSWPA");

// Fetch student
router.get("/studentSWPA/:studentID", getStudentByID);

// Update student (phone & profile pic)
router.put("/studentSWPA/:studentID", updateStudent);

module.exports = router;
