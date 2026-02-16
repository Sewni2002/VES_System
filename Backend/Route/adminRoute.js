
// Route/adminRoute.js
const express = require("express");
const router = express.Router();
const adminController = require("../Controllers/adminDashboardControl");

// ✅ Correct usage
router.get("/dashboard-stats", adminController.getDashboardData);

module.exports = router;
