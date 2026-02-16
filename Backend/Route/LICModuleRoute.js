const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICModuleController");

// /api/modules
router.post("/",     ctrl.createModule);
router.get("/",      ctrl.getModules);
router.get("/validate", ctrl.validateModuleForCohort); // optional helper
router.get("/:id",   ctrl.getModule);
router.put("/:id",   ctrl.updateModule);
router.delete("/:id",ctrl.deleteModule);

module.exports = router;
