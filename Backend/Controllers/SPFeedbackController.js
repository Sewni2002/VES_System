const Feedback = require("../Model/FeedbackModel");

exports.submitFeedback = async (req, res) => {
  const { studentID, rating, comments, questions } = req.body;

  try {
    // check if feedback already exists for this student
    const existing = await Feedback.findOne({ studentID });
    if (existing) {
      return res
        .status(400)
        .json({ error: "Feedback already submitted by this student" });
    }

    const feedback = new Feedback({ studentID, rating, comments, questions });
    await feedback.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
