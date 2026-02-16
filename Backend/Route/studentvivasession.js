// studentvivasession.js
const express = require("express");
const router = express.Router();
const GetVivaSession = require("../Model/Scheduler");

// POST: start a session
router.post("/startsession/:sessionID", async (req, res) => {
  try {
    const sessionID = req.params.sessionID;

    const session = await GetVivaSession.findOneAndUpdate(
      { sessionId: sessionID },  
      { active: true }, // mark session as active
      { new: true }
    );

    res.json({ success: true, sessionID: session.sessionid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET: fetch active session for students
router.get("/activesession", async (req, res) => {
  try {
    const activeSession = await GetVivaSession.findOne({ active: true });
    if (activeSession) res.json({ sessionID: activeSession.sessionid });
    else res.json({});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router; // ✅ Must export the router object
