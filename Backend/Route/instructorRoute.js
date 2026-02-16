const express = require("express");
const router = express.Router();

const { createInstructor,getAllInstructors} = require("../Controllers/InstructorController"); // check this path!


router.post("/create", createInstructor);


//vindy part
router.get("/", getAllInstructors)


module.exports = router;
