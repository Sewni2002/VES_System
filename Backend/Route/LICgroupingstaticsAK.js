const express = require("express");
const router = express.Router();
const LICGroup = require("../Model/LICGroup");

// GET /api/licgroups/stats-recent
router.get("/stats-recent", async (req, res) => {
  try {
    const today = new Date();
    const past5 = new Date();
    past5.setDate(today.getDate() - 4); // last 5 days including today

    // Fetch groups assigned in the last 5 days
    const groups = await LICGroup.find({
      assignedDate: { $gte: past5, $lte: today },
    });

    // Aggregate student counts by date
    const countsByDate = {};
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      countsByDate[key] = 0;
    }

    groups.forEach((g) => {
      const dateKey = g.assignedDate.toISOString().slice(0, 10);
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + g.members.length;
    });

    // Convert to array for frontend
    const data = Object.keys(countsByDate)
      .sort()
      .map((date) => ({ date, students: countsByDate[date] }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
