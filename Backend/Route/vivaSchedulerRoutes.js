// Route/vivaSchedulerRoutes.js
const express = require("express");
const router = express.Router();
const { getVivaForStudent } = require("../Controllers/SchedulerControllerSWPA");

// GET viva schedule for a student by studentID
// Example: GET /api/viva-scheduler/ITD1751622637492
router.get("/:sid", getVivaForStudent);

module.exports = router;
