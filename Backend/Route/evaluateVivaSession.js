const express = require("express");
const router = express.Router();
const GetInstructorAllocation = require("../Model/GetInstructorAllocation");
const Scheduler = require("../Model/Scheduler");

// GET viva session details by instructorID
router.get("/evaluatevivasession/:instructorID", async (req, res) => {
  try {
    const instructorID = req.params.instructorID;

    // Find all sessions for this instructor
    const sessions = await Scheduler.find({ instructorId: instructorID }).lean();

    // Map the required response
    const result = sessions.map((session) => ({
      instructorID: session.instructorId,
      groupID: session.groupId,
      sessionID: session.sessionId,
      date: session.scheduledDateTime ? session.scheduledDateTime.toISOString().split("T")[0] : null, // extract date
      time: session.startTime , // extract HH:mm
      hallNumber: session.hallNumber || null,
      completed: session.completed ? true : false // optional, only if you add "completed" in schema
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching viva session:", error);
    res.status(500).json({ error: "Server Error" });
  }
});





router.get("/getgroups/:instructorID/:sessionID", async (req, res) => {
  try {
    const { instructorID, sessionID } = req.params;

    // Find all allocations for this instructor and session
    const allocations = await Scheduler.find({
      instructorId: instructorID,
      sessionId: sessionID
    });

    res.json(allocations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
