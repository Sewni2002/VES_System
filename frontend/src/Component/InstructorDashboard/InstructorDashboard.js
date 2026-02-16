// 📁 components/studentdashboard/StudentDashboard.js

import React from "react";

function InstructorDashboard() {
  const instructorID = localStorage.getItem("instructorID");

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎉 Welcome to the Instructor Dashboard</h2>
      <p>Student ID: {instructorID}</p>
    </div>
  );
}

export default InstructorDashboard;
