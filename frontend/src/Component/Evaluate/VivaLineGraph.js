import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './VivaLineGraph.css';
import INTNav from '../nav/INTnav';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function VivaLineGraph() {
  const [monthlyVivas, setMonthlyVivas] = useState([]);
  const [studentMarks, setStudentMarks] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [summaryReport, setSummaryReport] = useState([]);
  const [vivaSummary, setVivaSummary] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [uploadEnabled, setUploadEnabled] = useState(false);

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    fetch('/api/statistics/monthly-vivas').then(res => res.json()).then(setMonthlyVivas).catch(console.error);
    fetch('/api/statistics/student-marks').then(res => res.json()).then(setStudentMarks).catch(console.error);
    fetch('/api/statistics/attendance-summary').then(res => res.json()).then(setAttendanceSummary).catch(console.error);
    fetch('/api/statistics/summary-report').then(res => res.json()).then(setSummaryReport).catch(console.error);

    fetch('/api/vivasummary')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const latest = data[0];
          setVivaSummary(latest);

          const today = new Date();
          const endDate = new Date(latest.endDate);
          endDate.setHours(23, 59, 59, 999);

          setLinkEnabled(today >= endDate);
          setUploadEnabled(today >= endDate);
          setShareLink(latest.link || "");
        }
      })
      .catch(console.error);
  }, []);

  // ---------------- DOWNLOAD PDF & UPLOAD ----------------
  const downloadPDF = async () => {
    if (!vivaSummary) {
      alert("No viva summary found.");
      return;
    }

    if (!uploadEnabled) {
      alert("You can upload the PDF only after the viva end date.");
      return;
    }

    const input = document.getElementById('report-section');
    html2canvas(input).then(async (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      pdf.save('summary-report.pdf');

      const blob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', blob, 'summary-report.pdf');

      try {
        const res = await fetch(`/api/vivasummary/upload/${vivaSummary._id}`, {
          method: 'POST',
          body: formData,
        });
        const updatedViva = await res.json();
        setShareLink(updatedViva.link);
        alert("PDF uploaded successfully!");
      } catch (err) {
        console.error("Failed to upload PDF", err);
        alert("Failed to upload PDF.");
      }
    });
  };

  return (
    <>
      <INTNav />
    <div className="viva-container">
      <h2>Summary Dashboard</h2>

      {/* Monthly Viva Line Chart */}
      <div className="chart-card">
        <h3>Monthly Viva Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyVivas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="vivas" stroke="#28a745" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Marks per Student Bar Chart */}
      <div className="chart-card">
        <h3>Marks per Student</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={studentMarks}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="student" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="fullmark" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Pie Chart */}
      <div className="chart-card">
        <h3>Attendance Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={attendanceSummary}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {attendanceSummary.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Full Summary Report */}
      <div id="report-section">
        <h3>Summary Report</h3>
        <table>
          <thead>
            <tr>
              <th>SID</th>
              <th>Name</th>
              <th>Group ID</th>
              <th>Full Marks</th>
              <th>Automated Marks</th>
              <th>Manual Marks</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(summaryReport) && summaryReport.map((s, idx) => (
              <tr key={idx}>
                <td>{s.sid}</td>
                <td>{s.name}</td>
                <td>{s.gid}</td>
                <td>{s.fullmark}</td>
                <td>{s.automatedmarks}</td>
                <td>{s.manualmarks}</td>
                <td>{Array.isArray(s.attendance) ? s.attendance.map(a => a.status).join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Button with Dynamic Text */}
      <button className="pdf-button" onClick={downloadPDF} style={{marginRight:"20px"}}>
        {uploadEnabled ? "Download & Upload PDF" : "Upload available after end date"}
      </button>


      <a
        href={linkEnabled ? shareLink : "#"}
        target="_blank"
        rel="noopener noreferrer"
        className={`share-link-button ${linkEnabled ? "" : "disabled"}`}
        onClick={(e) => !linkEnabled && e.preventDefault()}
      >
        {linkEnabled ? "Share Viva PDF" : "Share link available after viva end date"}
      </a>

          <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
    </>
  );
}

export default VivaLineGraph;
