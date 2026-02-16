const mongoose = require("mongoose");

const vivaSessionSchema = new mongoose.Schema({
  sessionid: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  completed: { type: Boolean,required: true }, 
  active: { type: Boolean, default: false } 


});

const GetVivaSession = mongoose.model("vivasession", vivaSessionSchema);
module.exports = GetVivaSession;
