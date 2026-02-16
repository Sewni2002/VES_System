const express = require('express');
const {createSchedule, getTodaySchedules, changeSubInstructor, changeNotes, deleteSchedule, getScheduleById, approveVivaSchedule, getAllSchedules, updateSchedule} = require('../Controllers/SchedulerController')



//vindy
const router = express.Router();

router.post('/create', createSchedule)
router.get('/today', getTodaySchedules)
router.put('/substitute/:id', changeSubInstructor)
router.put('/notes/:id', changeNotes)
router.delete('/delete/:id', deleteSchedule)
router.get('/:id', getScheduleById)
router.put('/status/:id', approveVivaSchedule)
router.get('/', getAllSchedules)
router.put('/:id', updateSchedule);

module.exports = router