// Model: LICGroup.js
const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    studentDocId: { type: mongoose.Schema.Types.ObjectId, ref: "LICStudent", required: true },
    studentId:    { type: String, required: true },  // snapshot
    name:         { type: String, required: true },  // snapshot
    currentGPA:   { type: Number, default: null },   // snapshot
  },
  { _id: false }
);

const LICGroupSchema = new mongoose.Schema(
  {
    groupId:        { type: String, required: true, unique: true }, // e.g., Y2S1-001
    groupName:      { type: String, default: "" },                  // e.g., "Group 1"
    year:           { type: Number, required: true },
    semester:       { type: Number, required: true },
    moduleCode:     { type: String, default: "" },

    // Members snapshot
    members:        { type: [MemberSchema], default: [] },

    // Topic snapshot (can be repeated across groups)
    topicId:        { type: String, default: null },
    topicName:      { type: String, default: null },

    assignedDate:   { type: Date, required: true },
    assignedBy:     { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "LIC_Group",
  }
);

LICGroupSchema.index({ year: 1, semester: 1, moduleCode: 1 });
LICGroupSchema.index({ groupId: 1 }, { unique: true });

module.exports = mongoose.model("LICGroup", LICGroupSchema);
