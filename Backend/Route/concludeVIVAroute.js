const express = require("express");
const router = express.Router();
const Scheduler = require("../Model/Scheduler"); // adjust path if needed

// ✅ Conclude Session by sessionId
router.put("/conclude-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const result = await Scheduler.updateMany(
      { sessionId },
      { $set: { completed: true, active: false } } // also deactivate the session
    );

    if (result.modifiedCount > 0) {
      res.json({
        success: true,
        message: `Session ${sessionId} marked as completed successfully.`,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No matching session found or already completed.",
      });
    }
  } catch (error) {
    console.error("❌ Error concluding session:", error);
    res.status(500).json({
      success: false,
      message: "Server error while concluding session.",
    });
  }
});

module.exports = router;
