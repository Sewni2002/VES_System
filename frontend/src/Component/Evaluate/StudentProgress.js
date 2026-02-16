import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./StudentProgress.css";

function StudentProgress() {
  const { sid } = useParams();
  const [student, setStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [automatedMarks, setAutomatedMarks] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [manualMarks, setManualMarks] = useState(null); // null until fetched
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // Fetch student details
        const studentRes = await fetch(`http://localhost:5000/api/students/by-sid/${sid}`);
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Fetch group info
        if (studentData?.gid) {
          const groupRes = await fetch(`http://localhost:5000/api/groups/by-gid/${studentData.gid}`);
          const groupData = await groupRes.json();
          setGroup(groupData);
        }

        // Fetch automated marks
        const autoRes = await fetch(`http://localhost:5000/api/automatedmarks/by-sid/${sid}`);
        const autoData = await autoRes.json();
        setAutomatedMarks(autoData);

        // Fetch attendance
        const attRes = await fetch(`http://localhost:5000/api/attendance/by-sid/${sid}`);
        const attData = await attRes.json();
        setAttendance(attData);

        // Fetch manual marks from FullMarks
        const fullMarksRes = await fetch(`http://localhost:5000/api/fullmarks/by-sid/${sid}`);
        if (fullMarksRes.ok) {
          const fullMarksData = await fullMarksRes.json();
          const marksObj = Array.isArray(fullMarksData) ? fullMarksData[0] : fullMarksData;

          let mm = 0;
          if (marksObj && marksObj.manualmarks !== undefined && marksObj.manualmarks !== null) {
            const val = marksObj.manualmarks;
            // Handle MongoDB extended JSON or string
            if (typeof val === "object" && val.$numberInt !== undefined) {
              mm = parseInt(val.$numberInt, 10);
            } else {
              mm = Number(val); // converts string like "9" to number 9
            }
            if (isNaN(mm)) mm = 0;
          }
          setManualMarks(mm);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load student progress");
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [sid]);

  if (loading) return <p>Loading student progress...</p>;
  if (error) return <p>{error}</p>;

  // Check if automated evaluation is done
  const automatedDone = automatedMarks && (
    (automatedMarks.easyCount || 0) > 0 ||
    (automatedMarks.interCount || 0) > 0 ||
    (automatedMarks.advancedCount || 0) > 0
  );

  // Manual evaluation: mark as done if manualMarks > 0
  const manualEvalDone = manualMarks > 0;

  // Overall evaluation status
  const evaluationCompleted = automatedDone && attendance?.status === "Present" && manualEvalDone;

  return (
    <div className="student-progress-container">
      <div className="header">
        <img src="/logo.png" alt="Logo" className="logo" />
        <h1>Student Progress Dashboard</h1>
      </div>

      {/* Student Info */}
      <section className="info-card">
        <h3>Student Information</h3>
        <p><strong>Student ID:</strong> {student?.idNumber}</p>
        <p><strong>Name:</strong> {student?.name}</p>
        <p><strong>Group ID:</strong> {student?.gid || "N/A"}</p>
      </section>

      {/* Group Info */}
      {group && (
        <section className="info-card">
          <h3>Group Information</h3>
    {/*  <p><strong>Topic:</strong> {group.topic}</p>*/}
          <p><strong>Members:</strong> {group.members?.join(", ") || "N/A"}</p>
        </section>
      )}

      {/* Automated Evaluation */}
      <section className="status-card">
        <h3>Automated Evaluation</h3>
        <p>Status: {automatedDone ? "✅ Completed" : "⏳ Not Attempted Yet"}</p>
        {automatedDone && (
          <div className="auto-summary">
            <p><strong>Easy Questions:</strong> {automatedMarks.easyCount}</p>
            <p><strong>Intermediate Questions:</strong> {automatedMarks.interCount}</p>
            <p><strong>Advanced Questions:</strong> {automatedMarks.advancedCount}</p>
          </div>
        )}
      </section>

      {/* Attendance */}
      <section className="status-card">
        <h3>Attendance</h3>
        <p>Status: {attendance?.status || "Not Marked Yet"}</p>
      </section>

      {/* Manual Evaluation */}
      <section className="status-card">
        <h3>Manual Evaluation</h3>
        <p>
          {manualEvalDone
            ? `✅ Completed (${manualMarks} marks)`
            : "⏳ Not Attempted"}
        </p>
      </section>

      {/* Overall Evaluation */}
      <section className="status-card overall">
        <h3>Overall Evaluation Progress</h3>
        <p>
          {evaluationCompleted ? (
            "🎉 Evaluation Completed Successfully!"
          ) : (
            <span style={{ color: "#00d07a", fontWeight: "600" }}>
              ⏳ Evaluation in Progress. Please wait for updates.
            </span>
          )}
        </p>
      </section>
       <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
}

export default StudentProgress;
