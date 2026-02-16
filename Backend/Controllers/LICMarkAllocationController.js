// Backend/Controllers/LICMarkAllocationController.js
const MarkAllocation = require("../Model/LICMarkAllocation");

// helpers 
function sumWeights(criteria = []) {
  return criteria.reduce((s, c) => s + Number(c.weight || 0), 0);
}

// CREATE
exports.createMarkAllocation = async (req, res) => {
  try {
    const { year, moduleCode, context, totalMarks, criteria, createdBy } = req.body;

    if (!year || !moduleCode || !context || !totalMarks || !Array.isArray(criteria) || criteria.length === 0) {
      return res.status(400).json({ message: "year, moduleCode, context, totalMarks, criteria are required" });
    }

    
    const total = sumWeights(criteria);
    if (total !== 100) {
      return res.status(400).json({ message: `Criteria weights must total 100 (got ${total}).` });
    }

    const doc = await MarkAllocation.create({
      year: Number(year),
      moduleCode,
      context,
      totalMarks: Number(totalMarks),
      criteria: criteria.map(c => ({ name: String(c.name).trim(), weight: Number(c.weight) })),
      createdBy,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("createMarkAllocation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// LIST 
exports.getMarkAllocations = async (req, res) => {
  try {
    const { year, moduleCode, page = 1, limit = 50 } = req.query;
    const q = {};
    if (year) q.year = Number(year);
    if (moduleCode) q.moduleCode = moduleCode;

    const items = await MarkAllocation.find(q)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await MarkAllocation.countDocuments(q);
    res.json({ total, page: Number(page), limit: Number(limit), items });
  } catch (err) {
    console.error("getMarkAllocations error:", err);
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getMarkAllocation = async (req, res) => {
  try {
    const doc = await MarkAllocation.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error("getMarkAllocation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateMarkAllocation = async (req, res) => {
  try {
    const body = req.body;

    if (Array.isArray(body.criteria)) {
      const total = sumWeights(body.criteria);
      if (total !== 100) {
        return res.status(400).json({ message: `Criteria weights must total 100 (got ${total}).` });
      }
      body.criteria = body.criteria.map(c => ({ name: String(c.name).trim(), weight: Number(c.weight) }));
    }

    if (body.totalMarks != null) body.totalMarks = Number(body.totalMarks);
    if (body.year != null) body.year = Number(body.year);

    const doc = await MarkAllocation.findByIdAndUpdate(req.params.id, body, { new: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    console.error("updateMarkAllocation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteMarkAllocation = async (req, res) => {
  try {
    const doc = await MarkAllocation.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteMarkAllocation error:", err);
    res.status(500).json({ message: err.message });
  }
};
