const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const Scheduler = require("../Model/Scheduler");
const Feedback = require("../Model/FeedbackModel");
const Group = require("../Model/Group");

// === Utility: Remove duplicates by key ===
const uniqueByKey = (arr, key) => [...new Map(arr.map(item => [item[key], item])).values()];

// === Header ===
const addHeader = (doc) => {
  const logoPath = path.join(__dirname, "../../frontend/public/logoblack.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 20, { width: 70 });
  }
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("Admin Generated Report", 40, 20, { align: "center" })
    .moveDown();
};

// === Footer ===
const addFooter = (doc, adminID) => {
  const bottom = doc.page.height - 53;
  doc
    .fontSize(10)
    .font("Helvetica-Oblique")
    .text(`Computer generated report for Admin ID: ${adminID}`, 20, bottom, {
      align: "center",
    });
};

// === Table Borders ===
const drawTableBorders = (doc, startX, startY, colWidths, rowHeight, rowCount) => {
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);

  // Vertical lines
  let x = startX;
  for (let i = 0; i <= colWidths.length; i++) {
    doc.moveTo(x, startY).lineTo(x, startY + rowCount * rowHeight).stroke();
    x += colWidths[i] || 0;
  }

  // Horizontal lines
  for (let j = 0; j <= rowCount; j++) {
    const y = startY + j * rowHeight;
    doc.moveTo(startX, y).lineTo(startX + tableWidth, y).stroke();
  }
};



// =====================================================
// === 1️⃣ SCHEDULE REPORT ===
// =====================================================
router.get("/schedule-pdf", async (req, res) => {
  try {
    const adminID = req.query.adminID || "N/A";
    const schedules = await Scheduler.find({});
    const uniqueSchedules = uniqueByKey(schedules, "sessionId");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=schedule_report_${Date.now()}.pdf`);

    addHeader(doc);

    const startX = 40;
    let startY = 120;
    const rowHeight = 20;
    const colWidths = [70, 60, 90, 90, 70, 50, 50];
    const headers = ["Session ID", "Group ID", "Group Topic", "Instructor", "Date", "Start", "End"];

    // Title
    doc.font("Helvetica-Bold").fontSize(14).text("Schedules", startX, 90);

    // Header row
    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#D3D3D3").stroke().fillColor("#000");
    let x = startX;
    headers.forEach((header, i) => {
      doc.font("Helvetica-Bold").fontSize(9).text(header, x + 2, startY + 5, {
        width: colWidths[i] - 4,
        align: "center",
      });
      x += colWidths[i];
    });

    startY += rowHeight;
    doc.font("Helvetica").fontSize(8);
    uniqueSchedules.forEach(sch => {
      const row = [
        sch.sessionId || "-",
        sch.groupId || "-",
        sch.groupTopic || "-",
        sch.instructorId || "-",
        new Date(sch.scheduledDateTime).toLocaleDateString(),
        sch.startTime || "-",
        sch.endTime || "-",
      ];
      let xPos = startX;
      row.forEach((cell, i) => {
        doc.text(cell, xPos + 2, startY + 5, {
          width: colWidths[i] - 4,
          align: "center",
        });
        xPos += colWidths[i];
      });
      startY += rowHeight;
    });

    drawTableBorders(doc, startX, 120, colWidths, rowHeight, uniqueSchedules.length + 1);
    addFooter(doc, adminID);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate Schedule PDF" });
  }
});



// =====================================================
// === 2️⃣ FEEDBACK REPORT ===
// =====================================================
router.get("/feedback-pdf", async (req, res) => {
  try {
    const adminID = req.query.adminID || "N/A";
    const feedbacks = await Feedback.find({});
    const uniqueFeedbacks = uniqueByKey(feedbacks, "studentID");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=feedback_report_${Date.now()}.pdf`);

    addHeader(doc);

    const startX = 50;
    let startY = 120;
    const rowHeight = 40;
    const colWidths = [80, 60, 200, 80, 80];
    const headers = ["Student ID", "Rating", "Comments", "Questions", "Date"];

    // Title
    doc.font("Helvetica-Bold").fontSize(14).text("Feedback Summary", startX, 90);

    // Header row
    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#D3D3D3").stroke().fillColor("#000");
    let x = startX;
    headers.forEach((header, i) => {
      doc.font("Helvetica-Bold").fontSize(9).text(header, x + 2, startY + 5, {
        width: colWidths[i] - 4,
        align: "center",
      });
      x += colWidths[i];
    });

    startY += rowHeight;
    doc.font("Helvetica").fontSize(8);
    uniqueFeedbacks.forEach((fb) => {
      const row = [
        fb.studentID || "-",
        fb.rating?.toString() || "-",
        fb.comments || "-",
        fb.questions || "-",
        new Date(fb.createdAt).toLocaleDateString(),
      ];
      let xPos = startX;
      row.forEach((cell, i) => {
        doc.text(cell, xPos + 2, startY + 5, {
          width: colWidths[i] - 4,
          align: "center",
        });
        xPos += colWidths[i];
      });
      startY += rowHeight;
    });

    drawTableBorders(doc, startX, 120, colWidths, rowHeight, uniqueFeedbacks.length + 1);
    addFooter(doc, adminID);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate Feedback PDF" });
  }
});



// =====================================================
// === 3️⃣ STUDENT GROUPING REPORT ===
// =====================================================
router.get("/grouping-pdf", async (req, res) => {
  try {
    const adminID = req.query.adminID || "N/A";
    const groups = await Group.find({});
    const uniqueGroups = uniqueByKey(groups, "gid");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=grouping_report_${Date.now()}.pdf`);

    addHeader(doc);

    const startX = 70; //location of table
    let startY = 120;
    const rowHeight = 40;
    const colWidths = [70, 100, 200, 80];
    const headers = ["Group ID", "Group Name", "Members", "Assigned Date"];

    // Title
    doc.font("Helvetica-Bold").fontSize(14).text("Student Grouping Report", startX, 90);

    // Header row
    doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight).fill("#D3D3D3").stroke().fillColor("#000");
    let x = startX;
    headers.forEach((header, i) => {
      doc.font("Helvetica-Bold").fontSize(9).text(header, x + 2, startY + 5, {
        width: colWidths[i] - 4,
        align: "center",
      });
      x += colWidths[i];
    });

    startY += rowHeight;
    doc.font("Helvetica").fontSize(8);
    uniqueGroups.forEach((g) => {
      const row = [
        g.gid || "-",
        g.groupName || "-",
        g.members.join(", ") || "-",
        g.assignedDate ? new Date(g.assignedDate).toLocaleDateString() : "-",
      ];
      let xPos = startX;
      row.forEach((cell, i) => {
        doc.text(cell, xPos + 2, startY + 5, {
          width: colWidths[i] - 4,
          align: "center",
        });
        xPos += colWidths[i];
      });
      startY += rowHeight;
    });

    drawTableBorders(doc, startX, 120, colWidths, rowHeight, uniqueGroups.length + 1);
    addFooter(doc, adminID);
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate Grouping PDF" });
  }
});

module.exports = router;
