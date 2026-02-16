const express = require("express");
const router = express.Router();
const checklistController = require("../Controllers/SPchecklistController");

router.get("/:studentID", checklistController.initChecklist);
router.post("/mark", checklistController.markItemDone);

module.exports = router;
