import React, { useState, useEffect, useRef } from "react";
import "./QuestionGeneration.css";
import "./EvaluationStart.css";

const EvaluationStart = () => {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [evaluationStarted, setEvaluationStarted] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [evalloading, setevalloading] = useState(false); // For overlay
  const dropdownRef = useRef(null);
  
  const [instructorID, setInstructorID] = useState("");
    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  
  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




  const startEvaluation = () => {
    if (!agreeTerms) {
      alert("⚠️ You must agree to the terms and conditions to start the evaluation.");
      return;
    }

    setevalloading(true); // show overlay
    setEvaluationStarted(true);

    setTimeout(() => {
      setevalloading(false);

      // Open student quiz view in a new window
      window.open("/studentQuizView", "studentQuizView", "width=900,height=700");

      // Redirect instructor to quiz view
      window.location.href = "/instructorQuizView";
    }, 2000); // 2 seconds
  };


//header

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
    <div className="question-gen-page">
      {/* Header */}
      




<div className="qg-header">
        <img src="/logoblack.png" alt="Logo" className="qg-logo" />
        <h3>Start Evaluation {instructorID ? `(Instructor ID: ${instructorID})` : ""}</h3>
        
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

      {/* Main content */}
      <div className="eval-container">
        <div className="eval-box">
          <h3>Welcome to the Evaluation</h3>
          <p><strong>Instructor ID:</strong> {instructorID || "N/A"}</p>

          {/* Instructions */}
          <div className="eval-instructions">
            <h4>Instructions:</h4>
            <ul>
              <li>This is the Viva Evaluation platform for live student assessments.</li>
              <li>After starting the evaluation, the interface will display questions for both the instructor and the student.</li>
              <li>Pre-generated questions will be loaded automatically.</li>
              <li>Instructors can ask additional questions if the student fails a session.</li>
              <li>Please ensure a stable connection for a smooth evaluation experience.</li>
            </ul>
          </div>

          {/* Terms & Conditions */}
          <div className="eval-terms">
            <input 
              type="checkbox" 
              id="agreeTerms" 
              checked={agreeTerms} 
              onChange={(e) => setAgreeTerms(e.target.checked)} 
            />
            <label htmlFor="agreeTerms">
              I agree to the <strong>Terms and Conditions</strong> of this evaluation platform.
            </label>
          </div>

          {/* Start Evaluation Button */}
          {!evaluationStarted ? (
            <button 
              onClick={startEvaluation} 
              disabled={!agreeTerms} 
              className={`btn-start ${!agreeTerms ? "disabled" : ""}`}
            >
              Start Evaluation
            </button>
          ) : (
            <p className="eval-started-msg">✅ Evaluation has started!</p>
          )}
        </div>
      </div>

      {/* Loading overlay */}
      {evalloading && (
        <div className="eval-loading-overlay">
          <div className="eval-loader"></div>
          <p>Starting evaluation Please wait...</p>
        </div>
      )}

      {/* Footer */}
      <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
};

export default EvaluationStart;
