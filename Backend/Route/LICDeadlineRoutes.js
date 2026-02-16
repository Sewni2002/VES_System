const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICDeadlineController");

router.post("/", ctrl.createDeadline);
router.get("/", ctrl.getDeadlines);
router.get("/:id", ctrl.getDeadline);
router.put("/:id", ctrl.updateDeadline);
router.delete("/:id", ctrl.deleteDeadline);

module.exports = router;
