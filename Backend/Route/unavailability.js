const express = require('express');
const router = express.Router();
const Unavailability = require('../Model/InstructorUnavailability');

// Create unavailability
router.post('/create', async (req, res) => {
  try {
    const ua = new Unavailability(req.body);
    await ua.save();
    res.json(ua);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all unavailability records
router.get('/', async (req, res) => {
  const ua = await Unavailability.find();
  res.json(ua);
});

module.exports = router;
