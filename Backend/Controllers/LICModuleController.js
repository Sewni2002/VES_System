const mongoose = require("mongoose");
const LICModule = require("../Model/LICModule");

// Create
exports.createModule = async (req, res) => {
  try {
    const { moduleId, moduleName, academicYear, semester, credits, isActive = true } = req.body;
    if (!moduleId || !moduleName || !academicYear || !semester || credits == null) {
      return res.status(400).json({ message: "moduleId, moduleName, academicYear, semester, credits are required" });
    }
    const doc = await LICModule.create({
      moduleId: String(moduleId).trim(),
      moduleName: String(moduleName).trim(),
      academicYear: Number(academicYear),
      semester: Number(semester),
      credits: Number(credits),
      isActive: Boolean(isActive),
    });
    res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "moduleId already exists" });
    }
    res.status(500).json({ message: err.message || "Create failed" });
  }
};

// List with filters + pagination + search
exports.getModules = async (req, res) => {
  try {
    const { academicYear, semester, isActive, q, page = 1, limit = 100 } = req.query;
    const query = {};
    if (academicYear) query.academicYear = Number(academicYear);
    if (semester) query.semester = Number(semester);
    if (typeof isActive !== "undefined") query.isActive = isActive === "true";
    if (q) {
      query.$or = [
        { moduleId:   { $regex: q, $options: "i" } },
        { moduleName: { $regex: q, $options: "i" } },
      ];
    }

    const docs = await LICModule.find(query)
      .sort({ academicYear: 1, semester: 1, moduleId: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await LICModule.countDocuments(query);
    res.json({ total, page: Number(page), limit: Number(limit), items: docs });
  } catch (err) {
    res.status(500).json({ message: err.message || "List failed" });
  }
};

// Read one by document _id
exports.getModule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await LICModule.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || "Read failed" });
  }
};

// Update 
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

    if (typeof req.body.moduleId !== "undefined") delete req.body.moduleId; // keep moduleId immutable

    const doc = await LICModule.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};

// Delete
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });
    const doc = await LICModule.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed" });
  }
};

// Validate a module belongs to a given year/semester
exports.validateModuleForCohort = async (req, res) => {
  try {
    const { moduleId, academicYear, semester } = req.query;
    if (!moduleId || !academicYear || !semester) {
      return res.status(400).json({ message: "moduleId, academicYear, semester are required" });
    }
    const found = await LICModule.findOne({
      moduleId: String(moduleId),
      academicYear: Number(academicYear),
      semester: Number(semester),
      isActive: true,
    });
    res.json({ valid: !!found });
  } catch (err) {
    res.status(500).json({ message: err.message || "Validation failed" });
  }
};
