const mongoose = require("mongoose");
const LICTopic = require("../Model/LICTopic");

// Create
exports.createTopic = async (req, res) => {
  try {
    const { topicId, name, year, semester, moduleCode, tags = [] } = req.body;
    if (!topicId || !name || !year || !semester || !moduleCode) {
      return res.status(400).json({ message: "topicId, name, year, semester, moduleCode are required" });
    }
    const doc = await LICTopic.create({
      topicId: String(topicId).trim(),
      name: String(name).trim(),
      year: Number(year),
      semester: Number(semester),
      moduleCode: String(moduleCode).trim(),
      tags: Array.isArray(tags) ? tags : [],
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "topicId already exists" });
    }
    res.status(500).json({ message: err.message || "Create failed" });
  }
};

// List 
exports.getTopics = async (req, res) => {
  try {
    const { year, semester, moduleCode, q, page = 1, limit = 50 } = req.query;
    const query = {};
    if (year)      query.year = Number(year);
    if (semester)  query.semester = Number(semester);
    if (moduleCode) query.moduleCode = moduleCode;
    if (q) {
      query.$or = [
        { topicId: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
        { moduleCode: { $regex: q, $options: "i" } },
      ];
    }

    const docs = await LICTopic.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await LICTopic.countDocuments(query);
    res.json({ total, page: Number(page), limit: Number(limit), items: docs });
  } catch (err) {
    res.status(500).json({ message: err.message || "List failed" });
  }
};

// Read one
exports.getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await LICTopic.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || "Read failed" });
  }
};

// Update
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    // Disallow topicId changes 
    if (typeof req.body.topicId !== "undefined") delete req.body.topicId;

    const doc = await LICTopic.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};

// Delete
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await LICTopic.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
};
