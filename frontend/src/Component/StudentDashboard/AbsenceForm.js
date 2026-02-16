import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StuDashboard.css";
import "./AbsenceForm.css";


function AbsenceForm() {
  const [sid, setSid] = useState(localStorage.getItem("studentID") || "");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch student data for sidebar
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!sid) throw new Error("No Student ID found in localStorage");
        const res = await axios.get(`http://localhost:5000/api/SPstudentRoute/student/${sid}`);
        setStudent(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };
    fetchStudent();
  }, [sid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/SPabsence/submit", {
        sid,
        reason,
      });
      
      // Show alert instead of backend message
      alert("Absence request submitted successfully!");
      setReason("");
      setMessage(""); // clear any previous message
    } catch (err) {
      console.error("Submit Error:", err.response || err.message);
      setMessage(err.response?.data?.error || "Error submitting request");
    }
  };

  return (
    <div className="SP_dashboard_layout">
       {/* Sidebar */}
<div
  className="SP_UF_sidebar"
  style={{
    width: "250px",
    minWidth: "200px",
    backgroundColor: "#111",
    color: "#fff",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    padding: "1rem",
    boxSizing: "border-box",
    display: "flex",           
    flexDirection: "column",  
    alignItems: "center",      
    gap: "0.5rem"           
  }}
>
  {/* Title */}
  <h2 className="UF_sidebar_title" style={{ margin: 0, fontSize: "1.2rem" }}>
    Student Dashboard
  </h2>

  {/* Profile */}
  {student && (
    <div className="UF_profile" style={{ textAlign: "center" }}>
       <img
  src={student.photo ? `http://localhost:5000/studentimages/${student.photo}` : "/default-avatar.png"}
  alt="Profile"
  className="SP_sidebar_avatar"
  style={{
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "0.5rem",
    objectFit: "cover",
  }}
  onError={(e) => {
    // Fallback to student.photo if server URL fails
    if (student.photo) e.target.src = student.photo;
    else e.target.src = "/default-avatar.png"; // ultimate fallback
  }}
/>
      <p className="UF_name" style={{ margin: 0, fontSize: "0.95rem" }}>
        {student.iname}
      </p>
    </div>
  )}

  {/* Navigation Buttons */}
  <button className="UF_link" onClick={() => navigate("/studentdashboard")}>
    Dashboard
  </button>
  <button className="UF_link" onClick={() => navigate("/profile")}>
    Profile
  </button>
  <button className="UF_link" onClick={() => navigate("/upload")}>
    Upload Files
  </button>
 
  <button className="UF_link" onClick={() => navigate("/groupchat")}>
    Team Chat
  </button>
  <button className="UF_link" onClick={() => navigate("/announcements")}>
    Announcement Panel
  </button>
  <button className="UF_link" onClick={() => navigate("/absence")}>
    Absence Request Form
  </button>

  {/* Logout */}
  <button
    className="UF_link"
    onClick={() => {
      localStorage.clear();
      navigate("/login");
    }}
  >
    Logout
  </button>
</div>



      {/* Main content */}
      <div className="SP_dashboard_main" style={{ padding: "40px" }}>
        <div className="SP_absence-container">
          <h2>Absence Request Form</h2><br/>
          <form onSubmit={handleSubmit} className="SP_absence-form">
            <div>
              <label>Student ID:</label>
              <input
                type="text"
                value={sid}
                onChange={(e) => setSid(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Reason for Absence:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <button type="submit">Submit</button>
          </form>
          {message && <p className="SP_message">{message}</p>}
        </div>
        
      </div>
         <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
}

export default AbsenceForm;
