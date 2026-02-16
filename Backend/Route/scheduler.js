const express = require('express');
const router = express.Router();
const Scheduler = require('../Model/Scheduler');
const Attendance = require('../Model/Attendance');
const Notification = require('../Model/Notification');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// NodeMailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// CREATE session
router.post('/create', async (req, res) => {
  const sched = new Scheduler(req.body);
  await sched.save();
  res.json(sched);
});

// GET today's sessions by instructor id
// GET today's sessions by instructor


router.get('/today', async (req, res) => {
  try {
    const { instructorId } = req.query; 
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const filter = {
      scheduledDateTime: { $gte: todayStart, $lte: todayEnd }
    };

    if (instructorId) filter.instructorId = instructorId; // only add if provided

    const sessions = await Scheduler.find(filter);

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching today sessions:', error.stack || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// MARK attendance
router.post('/attendance', async (req, res) => {
  const attendance = new Attendance(req.body);
  await attendance.save();
  res.json(attendance);
});

// Assign substitute
router.put('/substitute/:id', async (req, res) => {
  const { substituteInstructor } = req.body;
  const updated = await Scheduler.findByIdAndUpdate(req.params.id, { substituteInstructor }, { new: true });
  res.json(updated);
});

// Send Email Reminder
// Send Email Reminder
/**
 * Uses Twilio’s REST Messaging API to send SMS messages.
 * Reference: https://www.twilio.com/docs/messaging (Message Resource)  
 *  
 * Uses Nodemailer for sending emails via SMTP.
 * Reference: https://nodemailer.com/ (SMTP transport & usage)
 */

router.post('/reminder/email', async (req, res) => {
  const { to, subject, text } = req.body;
  console.log("EMAIL REQUEST:", to, subject, text);
  try {
    const info = await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    console.log("EMAIL SENT:", info);
    res.json({ message: "Email sent", info });
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    res.status(500).json({ message: "Failed to send", error: err });
  }
});


// Send SMS Reminder
router.post('/reminder/sms', async (req, res) => {
  const { to, body } = req.body;
  const msg = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_NUMBER,
    to
  });
  res.json(msg);
});

// Notifications CRUD
router.post('/notification', async (req, res) => {
  const notif = new Notification(req.body);
  await notif.save();
  res.json(notif);
});

router.get('/notifications', async (req, res) => {
  const notifs = await Notification.find();
  res.json(notifs);
});

// Mark instructor unavailability
router.post('/unavailability', async (req, res) => {
  const InstructorUnavailability = require('../Model/InstructorUnavailability');
  const unavailability = new InstructorUnavailability(req.body);
  await unavailability.save();
  res.json(unavailability);
});

// Get unavailability
router.get('/unavailability', async (req, res) => {
  const InstructorUnavailability = require('../Model/InstructorUnavailability');
  const data = await InstructorUnavailability.find();
  res.json(data);
});

// Update notes per session
router.put('/notes/:id', async (req, res) => {
  const { notes } = req.body;
  const updated = await Scheduler.findByIdAndUpdate(req.params.id, { notes }, { new: true });
  res.json(updated);
});


// Assign substitute by groupId
router.put('/substitute/by-group/:groupId', async (req, res) => {
  try {
    const { instructorId } = req.body;  // get new substitute instructorId

    const updated = await Scheduler.findOneAndUpdate(
      { groupId: req.params.groupId },       // find session by groupId
      { substituteInstructor: instructorId }, // update substituteInstructor field
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Session not found for this groupId" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error assigning substitute:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Update notes per session by groupId
router.put('/notes/by-group/:groupId', async (req, res) => {
  try {
    const { notes } = req.body;

    const updated = await Scheduler.findOneAndUpdate(
      { groupId: req.params.groupId },   // find session by groupId
      { notes },                         // update notes field
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Session not found for this groupId" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});





module.exports = router;
