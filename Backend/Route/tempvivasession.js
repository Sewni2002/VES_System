const express = require("express");
const router = express.Router();
const GetVivaSession = require("../Model/GetVivaSession");

// Create a new viva session
router.post("/vivasession", async (req, res) => {
  console.log("req.body:", req.body); // DEBUG
  if (!req.body) return res.status(400).json({ error: "No data provided" });

  const { sessionid, date, time } = req.body;

  if (!sessionid || !date || !time)
    return res.status(400).json({ error: "sessionid, date, and time are required" });

  try {
    const newSession = new GetVivaSession({ sessionid, date, time });
    await newSession.save();
    res.json({ message: "Viva session created successfully", session: newSession });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
