const Scheduler = require('../Model/Scheduler');
const Hall = require('../Model/Hall');

console.log("SchedulerController loaded");

// Simplified createSchedule without slot checking
const createSchedule = async (req, res) => {
  try {
    console.log("📝 Creating schedule with data:", req.body);
    
    const sched = new Scheduler(req.body);
    await sched.save();
    
    console.log("✅ Schedule created successfully:", sched._id);
    res.status(201).json({ message: "Schedule created successfully!", sched });
  } catch (error) {
    console.error("❌ Failed to create schedule:", error);
    res.status(500).json({ message: "Failed to create schedule" });
  }
};

const getTodaySchedules = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
    
        console.log('Start:', todayStart);
        console.log('End:', todayEnd);
    
        const sessions = await Scheduler.find({
          scheduledDateTime: { $gte: todayStart, $lte: todayEnd }
        });
    
        console.log('Sessions found:', sessions);
        res.json(sessions);
      } catch (error) {
        console.error('Error fetching today sessions:', error.stack || error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

const changeSubInstructor = async (req, res) => {
    const { substituteInstructor } = req.body;
    const updated = await Scheduler.findByIdAndUpdate(req.params.id, { substituteInstructor }, { new: true });
    res.json(updated);
}

const changeNotes = async (req, res) => {
    const { notes } = req.body;
    const updated = await Scheduler.findByIdAndUpdate(req.params.id, { notes }, { new: true });
    res.json(updated);
}

const deleteSchedule = async (req, res) => {
  try {
    const deleted = await Scheduler.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Schedule not found' });
    res.status(200).json({ message: 'The schedule has been deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete schedule', error });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const schedule = await Scheduler.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule by ID:', error.stack || error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const approveVivaSchedule = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Scheduler.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update schedule status" });
    }
};

const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Scheduler.find().sort({ scheduledDateTime: 1 });
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching all schedules:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduledDateTime, startTime, endTime, groupTopic, hallNumber, notes } = req.body;

    const schedule = await Scheduler.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });

    // Update the schedule
    const updatedFields = {};
    if (scheduledDateTime) updatedFields.scheduledDateTime = scheduledDateTime;
    if (startTime) updatedFields.startTime = startTime;
    if (endTime) updatedFields.endTime = endTime;
    if (groupTopic) updatedFields.groupTopic = groupTopic;
    if (hallNumber) updatedFields.hallNumber = hallNumber;
    if (notes !== undefined) updatedFields.notes = notes;

    const updated = await Scheduler.findByIdAndUpdate(req.params.id, { $set: updatedFields }, { new: true });

    res.json(updated);
  } catch (error) {
    console.error("Failed to update schedule:", error.stack || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    createSchedule,
    getTodaySchedules,
    changeSubInstructor,
    changeNotes,
    deleteSchedule,
    getScheduleById,
    approveVivaSchedule,
    getAllSchedules,
    updateSchedule
}