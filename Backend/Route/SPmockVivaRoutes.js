const express = require("express");
const router = express.Router();
const mockVivaController = require("../Controllers/SPmockVivaController");

router.get("/:studentID", mockVivaController.getMockVivaQuestions);
router.post("/submit", mockVivaController.submitMockViva);

module.exports = router;
