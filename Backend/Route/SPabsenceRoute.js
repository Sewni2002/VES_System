const express = require("express");
const router = express.Router();
const { submitAbsence } = require("../Controllers/SPabsenceController");

// POST absence request
router.post("/submit", submitAbsence);

module.exports = router;
