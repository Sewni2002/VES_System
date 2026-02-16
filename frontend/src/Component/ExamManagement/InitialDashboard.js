import React, { useState, useEffect, useRef } from 'react';

import "./InitialDashboard.css";

function InitialDashboard() {


  const [time, setTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
  const [instructions, setInstructions] = useState([]); // ✅ add this

  const [instructorID, setInstructorID] = useState("");
    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  
    // Get licID from localStorage on mount
    useEffect(() => {
      const instructorID = localStorage.getItem("instructorID");
      if (instructorID) {
        setInstructorID(instructorID);
      } else {
        setShowSessionOverlay(true); // session missing → ask login
      }
    }, []);
  
    // Update clock every second
    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);
  
    // Close dropdown if clicked outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  

      useEffect(() => {
    const fetchInstructions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/instructionsgetannouncements");
        if (res.ok) {
          const data = await res.json();
          if (data.success) setInstructions(data.data);
        }
      } catch (err) {
        console.error("Failed to load instructions:", err);
      }
    };
    fetchInstructions();
  }, []);


    const toggleMenu = () => setMenuOpen(prev => !prev);
  
    const handleLogoutConfirm = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("instructorID");
      window.location.href = "/login";
    };
  
    // 🔹 Shared overlay styles
    const overlayStyle = {
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000
    };
  
    const cardStyle = {
      background: "#fff", padding: "30px", borderRadius: "12px",
      textAlign: "center", maxWidth: "420px", width: "90%",
      boxShadow: "0px 4px 20px rgba(0,0,0,0.2)"
    };
  
    const imageStyle = {
       height: "40px", marginBottom: "20px"
    };
  
    const buttonStyle = {
      padding: "10px 20px", border: "none", borderRadius: "6px",
      cursor: "pointer", fontSize: "14px"
    };
  
    const clockStyle = {
      display: "inline-block",
      minWidth: "100px", // ✅ fixed width prevents layout shift
      textAlign: "right"
    };
  


  return (


    
    <div className="dashboard-container">


         <div className="qg-header">
        <img src="/logoblack.png" alt="Logo" className="qg-logo" />
        <h3>Instructor Control Panel {instructorID ? `(Instructor ID: ${instructorID})` : ""}</h3>
        
        <div className="qg-header-right">
          <span className="clock" style={clockStyle}>{time.toLocaleTimeString()}</span>
          
          <div className="dropdown" ref={dropdownRef}>
            <button className="dropbtn" onClick={toggleMenu}>☰ Menu</button>
            {menuOpen && (
              <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowLogoutOverlay(true)}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>







{showSessionOverlay && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <img src="/logoblack.png" alt="Warning" style={imageStyle} />
            <h2 style={{ marginBottom: "15px" }}>Session Expired</h2>
            <p style={{ marginBottom: "25px", color: "#555" }}>
              Your session is not available.<br /> Please log in again to continue.
            </p>
            <button
              style={{ ...buttonStyle, background: "#d9534f", color: "#fff" }}
              onClick={handleLogoutConfirm}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

  {showLogoutOverlay && (
        <div style={overlayStyle}>
          <div style={cardStyle}>
            <img src="/logoblack.png" alt="Logout" style={imageStyle} />
            <h2 style={{ marginBottom: "15px" }}>Confirm Logout</h2>
            <p style={{ marginBottom: "25px", color: "#555" }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <button
                style={{ ...buttonStyle, background: "#d9534f", color: "#fff" }}
                onClick={handleLogoutConfirm}
              >
                Yes, Logout
              </button>
              <button
                style={{ ...buttonStyle, background: "#6c757d", color: "#fff" }}
                onClick={() => setShowLogoutOverlay(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Logo Section */}
      <img src="logoblack.png" alt="System Logo" className="dashboard-logo" />


      <p className="dashboard-description">
  Welcome, Instructor {instructorID ? `: ${instructorID}` : ""}!  
  <br />
  This is your central dashboard for managing viva sessions.  
  Please review the guidelines for each section carefully before proceeding.  
  You can generate tailored questions for students, conduct evaluations, and 
  monitor progress—all from here.  
</p>

<div className="options-row">
  {/* Question Generation Section */}
  <div className="option-box">
    <button
      onClick={() => (window.location.href = "/question-generation")}
      className="dashboard-button"
    >
      Question Generation
    </button>
    <div className="instruction-box">
      <p><strong>Instructions:</strong></p>
      <ul>
        <li>Prepare unique questions for each student.</li>
        <li>Align questions across 3 difficulty levels.</li>
        <li>Questions are based on student-submitted code.</li>
        <li>Finalize all questions before viva day.</li>
      </ul>
    </div>
  </div>

  {/* Evaluation Section */}
  <div className="option-box">
    <button
      onClick={() => (window.location.href = "/evaluation")}
      className="dashboard-button"
    >
      Start Auto Evaluation
    </button>
    <div className="instruction-box">
      <p><strong>Instructions:</strong></p>
      <ul>
        <li>Begin evaluations at the scheduled time.</li>
        <li>Verify student/group identity before starting.</li>
        <li>Record feedback immediately.</li>
        <li>After completing one student, call the next.</li>
      </ul>
    </div>
  </div>

  {/* Manual Evaluation Section */}
  <div className="option-box">
    <button
      onClick={() => (window.location.href = "/manual-evaluation")}
      className="dashboard-button"
    >
      Start Manual Evaluation
    </button>
    <div className="instruction-box">
      <p><strong>Instructions:</strong></p>
      <ul>
        <li>Instructors will grade students directly here.</li>
        <li>Remote viva sessions will be conducted in this section.</li>
        <li>Mark student attendance during evaluations.</li>
        <li>Access detailed analytics and performance reports.</li>
      </ul>
    </div>
  </div>
</div>


{/* Announcement Panel */}
      <div className="announcement-panel">
        <h3>Announcements / Instructions</h3>
        {instructions.length === 0 && <p>No announcements available.</p>}
        {instructions.map(inst => (
          <div key={inst.instructionId} className="announcement-card">
            <h4>{inst.context}</h4>
            <p>{inst.details}</p>
            {inst.attachments && inst.attachments.length > 0 && (
              <ul>
                {inst.attachments.map((att, idx) => (
                  <li key={idx}>
                    <a href={att.url} target="_blank" rel="noopener noreferrer">{att.label}</a>
                  </li>
                ))}
              </ul>
            )}
            <small>Created by: {inst.createdBy}</small>
          </div>
        ))}
      </div>


      {/*  Footer */}
         <div className="cel-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
}

export default InitialDashboard;
