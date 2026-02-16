const Instruction = require("../Model/LICInstructions");

// CREATE
exports.createInstruction = async (req, res) => {
  try {
    const { year, moduleCode, context, details, attachments, createdBy } = req.body;
    if (!year || !moduleCode || !context) {
      return res.status(400).json({ message: "year, moduleCode, context are required" });
    }
    const doc = await Instruction.create({ year, moduleCode, context, details, attachments, createdBy });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST
exports.getInstructions = async (req, res) => {
  try {
    const { year, moduleCode, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (year) filter.year = Number(year);
    if (moduleCode) filter.moduleCode = moduleCode;
    if (q) filter.context = { $regex: q, $options: "i" };

    const items = await Instruction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Instruction.countDocuments(filter);
    res.json({ total, page: Number(page), limit: Number(limit), items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getInstruction = async (req, res) => {
  try {
    const doc = await Instruction.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateInstruction = async (req, res) => {
  try {
    const doc = await Instruction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteInstruction = async (req, res) => {
  try {
    const doc = await Instruction.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
