// Route: LICGroupRoute.js
const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICGroupController");

// Generate draft (in-memory preview) and Save (confirm)
router.post("/generate-draft", ctrl.generateDraft);
router.post("/save", ctrl.saveGroups);

// Saved groups
router.get("/", ctrl.listGroups);
router.get("/:id", ctrl.getGroup);
router.delete("/:id", ctrl.deleteGroup);

module.exports = router;
