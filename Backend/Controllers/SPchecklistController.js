const Checklist = require("../Model/Checklist");
const MockVivaAttempt = require("../Model/MockVivaAttempt");

// Initialize checklist for a student
exports.initChecklist = async (req, res) => {
  try {
    const { studentID } = req.params;
    let checklist = await Checklist.findOne({ studentID });

    if (!checklist) {
      checklist = new Checklist({
        studentID,
        items: [
          { title: "Mock Viva Attempt 1" },
          { title: "Mock Viva Attempt 2" },
          { title: "Mock Viva Attempt 3" },
          { title: "Organize Supporting Documents (ER Diagrams, UseCase Diagrams" },
          { title: "Prepare Presentation Slides" },
          { title: "Complete Project Backend" },
          { title: "Complete Project Frontend" },
          { title: "Submit Project Files" },
          { title: "Team Practice Session" },
          { title: "Print Final Project Report" }
        ]
      });
      await checklist.save();
    }

    res.json(checklist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to initialize checklist" });
  }
};

// Mark item manually
exports.markItemDone = async (req, res) => {
  try {
    const { studentID, index } = req.body;
    const checklist = await Checklist.findOne({ studentID });
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    checklist.items[index].done = true;
    checklist.items[index].completedAt = new Date();
    await checklist.save();

    res.json(checklist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update checklist item" });
  }
};

// Auto update after mock viva attempt
exports.updateAfterMockViva = async (studentID) => {
  const checklist = await Checklist.findOne({ studentID });
  if (!checklist) return;

  const attempts = await MockVivaAttempt.find({ studentID });
  attempts.forEach((a, idx) => {
    if (checklist.items[idx] && !checklist.items[idx].done) {
      checklist.items[idx].done = true;
      checklist.items[idx].completedAt = a.createdAt;
    }
  });

  await checklist.save();
};
