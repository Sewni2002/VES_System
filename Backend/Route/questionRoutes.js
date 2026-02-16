const express = require("express");
const router = express.Router();
const Question = require("../Model/Question");
const StudentSubmission = require("../Model/StudentSubmission"); // ✅ import added

const CorrectAnswer = require("../Model/CorrectAnswer");

// Save questions
router.post("/save-questions", async (req, res) => {
  try {
    const { studentId, groupId, questionsByLevel } = req.body;

    if (!studentId || !groupId || !questionsByLevel) {
      return res.status(400).json({ error: "Missing data" });
    }

    const savedQuestions = [];

    for (const level of Object.keys(questionsByLevel)) {
      const questions = questionsByLevel[level];

      for (const q of questions) {
        // Generate unique questionId
        const randomNo = Math.floor(1000 + Math.random() * 9000); // 4-digit random
        const questionId = `${level}_${studentId}_${randomNo}`;

        // Save Question
        const questionDoc = new Question({
          studentId,
          groupId,
          questionId,
          question: q.question,
          options: q.options,
        });
        await questionDoc.save();

        // Save Correct Answer
        const answerDoc = new CorrectAnswer({
          studentId,
          groupId,
          questionId,
          correctAnswer: q.correct,
        });
        await answerDoc.save();

        savedQuestions.push(questionId);
      }
    }

    res.json({ success: true, savedQuestions });

    await StudentSubmission.updateOne(
  { studentID: studentId },
  { $set: { questionGenerate: true } }
);
  } catch (err) {
    console.error("Error saving questions:", err);
    res.status(500).json({ error: "Failed to save questions" });
  }
});


router.get("/get-questions/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get all questions for the student
    const questions = await Question.find({ studentId });
    if (!questions || questions.length === 0) {
      return res.json({ success: false, message: "No saved questions found." });
    }

    // Get all correct answers
    const answers = await CorrectAnswer.find({ studentId });

    // Merge answers with questions
    const merged = questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q.questionId);
      return {
        questionId: q.questionId,
        question: q.question,
        options: q.options,
        studentId: q.studentId,
        groupId: q.groupId,
        correct: ans ? ans.correctAnswer : null,
      };
    });

    res.json({ success: true, questions: merged });
  } catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Update Question + Correct Answer
// Update Question
// Update
router.put("/update-question/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options, correctAnswer } = req.body;

    const updated = await Question.findOneAndUpdate(
      { questionId },
      { question, options },
      { new: true }
    );


       const updatedanswer = await CorrectAnswer.findOneAndUpdate(
      { questionId },
      { correctAnswer },
      { new: true }
    );



    if (!updated || !updatedanswer) return res.json({ success: false, message: "Question not found" });

    res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});

// Delete
router.delete("/delete-question/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await Question.findOneAndDelete({ questionId });

    if (!deleted) return res.json({ success: false, message: "Question not found" });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: err.message });
  }
});


// Get all saved questions (for download)
// Get all saved questions (for download)
router.get("/all", async (req, res) => {
  try {
    // Fetch all questions sorted by questionId ascending
    const questions = await Question.find({}).sort({ questionId: 1 });
    const answers = await CorrectAnswer.find({});

    if (!questions || questions.length === 0) {
      return res.json({ success: false, questions: [] });
    }

    const merged = questions.map((q) => {
      const ans = answers.find((a) => a.questionId === q.questionId);

      return {
        questionId: q.questionId || "Unknown",   // ✅ Always include questionId
        studentId: q.studentId || "Unknown",
        groupId: q.groupId || "Unknown",
        level: q.questionId ? q.questionId.split("_")[0] : "Unknown", // Use level from questionId
        question: q.question || "",
        options: q.options || [],
        correct: ans ? ans.correctAnswer : null,
      };
    });

    res.json({ success: true, questions: merged });
  } catch (err) {
    console.error("❌ Error fetching all questions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
