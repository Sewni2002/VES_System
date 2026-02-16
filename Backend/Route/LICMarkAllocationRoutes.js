// Backend/Route/LICMarkAllocationRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICMarkAllocationController");

router.post("/",    ctrl.createMarkAllocation);
router.get("/",     ctrl.getMarkAllocations);
router.get("/:id",  ctrl.getMarkAllocation);
router.put("/:id",  ctrl.updateMarkAllocation);
router.delete("/:id", ctrl.deleteMarkAllocation);

module.exports = router;
