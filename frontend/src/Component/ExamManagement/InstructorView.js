import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import "./InstructorView.css";

const socket = io("http://localhost:5000");

function InstructorView() {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
    const [instructorID, setInstructorID] = useState("");

    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  
  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/evaluatevivasession/${instructorID}`
        );
        const data = await res.json();
        const uniqueSessions = [];
        const seen = new Set();
        data.forEach((a) => {
          if (!seen.has(a.sessionID)) {
            seen.add(a.sessionID);
            uniqueSessions.push(a);
          }
        });
        setAllocations(uniqueSessions);
      } catch (err) {
        console.error(err);
      }
    };
    if (instructorID) fetchAllocations();
  }, [instructorID]);

  const handleSessionClick = (sessionID) => {
    setSelectedSession(sessionID);
    setShowModal(true);
  };

  const confirmStartSession = async () => {
    if (!selectedSession) return alert("No session selected");

    try {
      const res = await fetch(`http://localhost:5000/api/startsession/${selectedSession}`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        socket.emit("sendId", selectedSession);
        setShowModal(false);
        navigate(`/conductevaluation/${instructorID}/${selectedSession}`);
      } else {
        alert("Failed to start session.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelStartSession = () => {
    setShowModal(false);
    setSelectedSession(null);
  };

  // Clock updater
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dropdown close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Prepare data for chart
  const completedCount = allocations.filter(a => a.completed).length;
  const pendingCount = allocations.filter(a => !a.completed).length;
  const chartData = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount }
  ];
  const COLORS = ["#4caf50", "#ff9800"];





  //headerrr
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
    <div className="instructor-view-page">
      {/* Header */}
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


      {/* Main content */}
      <div className="ins-container">
        {/* Left: Session list */}
        <div className="ins-box">
          <h3>Instructor Evaluation Panel</h3>
          <p><strong>Instructor ID:</strong> {instructorID || "N/A"}</p>
          {allocations.length > 0 ? (
            <div className="session-list">
              {allocations.map((alloc, i) => (
                <div
                  key={i}
                  className={`session-card ${alloc.completed ? "completed" : "pending"}`}
                  onClick={() => handleSessionClick(alloc.sessionID)}
                >
                  <h4>Session ID: {alloc.sessionID}</h4>
                  <p>Status: <strong>{alloc.completed ? "✅ Completed" : "⏳ Pending"}</strong></p>
                  <p>Date: {alloc.date ? new Date(alloc.date).toLocaleDateString() : "N/A"}</p>
                  <p>Time: {alloc.time || "N/A"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No sessions assigned yet.</p>
          )}
        </div>

        {/* Right: Chart */}
        <div className="chart-box">
          <h3>Session Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="ivv-modal-overlay">
          <div className="ivv-modal-box">
            <img src="/logoblack.png" alt="Logo" className="ivv-modal-logo" />
            <h3>Start Session</h3>
            <p>Do you want to start session <strong>{selectedSession}</strong>?</p>
            <div className="ivv-modal-buttons">
              <button className="ivv-confirm-btn" onClick={confirmStartSession}>Yes, Start</button>
              <button className="ivv-cancel-btn" onClick={cancelStartSession}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="qg-footer">&copy; 2025 VES System. All rights reserved.</div>
    </div>
  );
}

export default InstructorView;
