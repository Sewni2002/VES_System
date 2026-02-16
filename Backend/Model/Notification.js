const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: String,
  type: String,
  recipient: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
