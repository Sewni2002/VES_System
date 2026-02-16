const express = require("express");
const router = express.Router();
const { createDean } = require("../Controllers/DeanController");

router.post("/create", createDean);

module.exports = router;
