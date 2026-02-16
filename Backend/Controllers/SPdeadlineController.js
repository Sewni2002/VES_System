const Deadline = require("../Model/Deadline");

// Get current submission deadline
const getSubmissionDeadline = async (req, res) => {
  try {
    const deadline = await Deadline.findOne({ type: "submission" }).sort({ endDate: -1 });
    if (!deadline) return res.status(404).json({ error: "No submission deadline set" });
    return res.json({ endDate: deadline.endDate });
  } catch (err) {
    console.error("getSubmissionDeadline error:", err);
    return res.status(500).json({ error: "Server error fetching deadline" });
  }
};

module.exports = { getSubmissionDeadline };
