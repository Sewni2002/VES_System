const MCQQuestion = require("../Model/MCQQuestion");
const MockVivaAttempt = require("../Model/MockVivaAttempt");
const { updateAfterMockViva } = require("./SPchecklistController");


function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// GET: fetch random 10 questions for a student attempt
exports.getMockVivaQuestions = async (req, res) => {
  try {
    const studentID = req.params.studentID;
    const attempts = await MockVivaAttempt.find({ studentID });
    const previousQuestions = attempts.flatMap(a => a.questions.map(q => String(q.questionID)));

    let questions = await MCQQuestion.find();
    questions = questions.filter(q => !previousQuestions.includes(String(q._id)));
    if (questions.length < 10) questions = await MCQQuestion.find(); // fallback if less than 10 new

    const selected = shuffleArray(questions).slice(0, 10);
    res.json({ questions: selected });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mock viva questions" });
  }
};

// POST: submit answers
exports.submitMockViva = async (req, res) => {
  try {
    const { studentID, answers } = req.body;
    const attempts = await MockVivaAttempt.find({ studentID });
    const attemptNumber = attempts.length + 1;
    if (attemptNumber > 3) 
      return res.status(400).json({ error: "Maximum 3 attempts reached" });

    let score = 0;
    const questionRecords = [];

    for (const a of answers) {
      const question = await MCQQuestion.findById(a.questionID);
      if (!question) {
        return res.status(400).json({ error: `Question not found: ${a.questionID}` });
      }

      // If student left question unanswered, treat as incorrect
      const selectedOption = a.selectedOption !== null ? a.selectedOption : null;
      const correct = selectedOption !== null && question.answer === selectedOption;
      if (correct) score++;

      questionRecords.push({
        questionID: question._id,
        selectedOption,
        correct
      });
    }

    let feedback = "";
    if (score === 10) feedback = "Excellent! Keep it up!";
    else if (score >= 7) feedback = "Good! Review a few weak topics.";
    else feedback = "Try again and focus on fundamentals.";

    const attempt = new MockVivaAttempt({
      studentID,
      attemptNumber,
      questions: questionRecords,
      score,
      feedback
    });

    await attempt.save();

    // auto update checklist
    await updateAfterMockViva(studentID);

    res.json({ score, feedback, attemptNumber });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit mock viva" });
  }
};
