const express = require("express");
const router = express.Router();
const { createLIC } = require("../Controllers/LICController");

// Add at least one route
router.post("/create", createLIC);

module.exports = router; 