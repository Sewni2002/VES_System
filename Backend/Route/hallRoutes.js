const express = require('express');
const { addHall, getAvailableSlots, getAllHalls, updateHallStatus } = require('../Controllers/hallController');

const router = express.Router();

router.post('/add', addHall);
router.get('/:hallNumber/:date', getAvailableSlots);
router.get('/', getAllHalls);
router.patch('/:hallNumber/status', updateHallStatus);

module.exports = router;
