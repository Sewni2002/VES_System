const express = require("express");
const router = express.Router();
const { getVivaForStudent } = require("../Controllers/SPschedulerController");

// GET viva schedule by student ID
router.get("/viva/:sid", getVivaForStudent);

module.exports = router;
