const express = require('express');
const {
  createOrUpdateAvailability,
  getGroupAvailability,
  getAvailabilityByWeek,
  checkTimeSlotAvailability,
  resetCollection
} = require('../Controllers/StudentAvailabilityController');

const router = express.Router();

router.post('/', createOrUpdateAvailability);
router.get('/group/:groupId/week/:weekStart', getGroupAvailability);
router.get('/week/:weekStart', getAvailabilityByWeek);
router.post('/check-availability', checkTimeSlotAvailability);
router.delete('/reset-collection', resetCollection);
//router.get('/date/:date', getAvailabilityByDate); // Add this line

module.exports = router;