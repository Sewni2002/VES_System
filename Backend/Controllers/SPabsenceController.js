// controllers/absenceController.js
const AutomatedMarks = require("../Model/AutomatedMarks");

// Submit absence request
exports.submitAbsence = async (req, res) => {
  try {
    const { sid, reason } = req.body;

    if (!sid || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create or update absence request
    let marks = await AutomatedMarks.findOne({ sid });

    if (marks) {
      marks.remotereq = reason;
      marks.easyCount = 0;
      marks.interCount = 0;
      marks.advancedCount = 0;
      marks.attempt = false;
      await marks.save();
      return res.status(200).json({ message: "Absence updated successfully", data: marks });
    }

    const newAbsence = new AutomatedMarks({
      sid,
      easyCount: 0,
      interCount: 0,
      advancedCount: 0,
      attempt: false,
      remotereq: reason,
    });

    await newAbsence.save();
    res.status(201).json({ message: "Absence request submitted successfully", data: newAbsence });
  } catch (err) {
    console.error("Absence submit error:", err.message);
    res.status(500).json({ error: "Server error submitting absence request" });
  }
};
