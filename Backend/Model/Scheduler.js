const mongoose = require('mongoose');

const SchedulerSchema = new mongoose.Schema({
  groupId: String,
  groupTopic: String,
  groupMembers: [String],
  scheduledDateTime: Date,
  instructorId: String,
  hallNumber: String,
  notes: String,
  startTime: String,//added for vindy
  endTime: String,//added for vindy
  sessionId:String,
  substituteInstructor: String,
  completed: { type: Boolean,required: true,default: false },
  active: { type: Boolean, default: false } ,

  status: {
    type: String,
    enum: ['Pending', 'Rejected', 'Accepted'],
    default: 'Pending'
  }//added for vindy
});

module.exports = mongoose.model('Scheduler', SchedulerSchema);
