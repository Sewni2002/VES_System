// routes/scheduler.js
const express = require('express');
const router = express.Router();
const Scheduler = require('../Model/Scheduler');

// Count schedules for a specific date and time
router.get('/count', async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query; // date in 'YYYY-MM-DD' format

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'date, startTime, and endTime are required' });
    }

    // Convert date to start & end of day for filtering
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Scheduler.countDocuments({
      scheduledDateTime: { $gte: startOfDay, $lte: endOfDay },
      startTime: startTime,
      endTime: endTime
    });

    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
