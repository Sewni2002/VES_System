const Deadline = require("../Model/LICDeadline");

// CREATE
exports.createDeadline = async (req, res) => {
  try {
    const { year, moduleCode, context, details, startDate, endDate, createdBy } = req.body;

    if (!year || !moduleCode || !context || !startDate || !endDate) {
      return res.status(400).json({ message: "year, moduleCode, context, startDate, endDate are required" });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const doc = await Deadline.create({ year, moduleCode, context, details, startDate, endDate, createdBy });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST (with optional filters)
exports.getDeadlines = async (req, res) => {
  try {
    const { year, moduleCode, from, to, page = 1, limit = 20 } = req.query;

    const q = {};
    if (year) q.year = Number(year);
    if (moduleCode) q.moduleCode = moduleCode;
    if (from || to) {
      q.endDate = {};
      if (from) q.endDate.$gte = new Date(from);
      if (to) q.endDate.$lte = new Date(to);
    }

    const docs = await Deadline.find(q)
      .sort({ endDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Deadline.countDocuments(q);
    res.json({ total, page: Number(page), limit: Number(limit), items: docs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getDeadline = async (req, res) => {
  try {
    const doc = await Deadline.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateDeadline = async (req, res) => {
  try {
    const body = req.body;
    if (body.startDate && body.endDate && new Date(body.startDate) > new Date(body.endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }
    const doc = await Deadline.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteDeadline = async (req, res) => {
  try {
    const doc = await Deadline.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
