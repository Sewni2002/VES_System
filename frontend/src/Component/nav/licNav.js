import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Nav() {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [lic, setLic] = useState(null);
  const [showSessionOverlay, setShowSessionOverlay] = useState(false);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);

  // Get licID from localStorage on mount
  useEffect(() => {
    const licID = localStorage.getItem("licID");
    if (licID) {
      setLic(licID);
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
    localStorage.removeItem("licID");
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
    <>
      {/* 🔹 Main Nav */}
      <div className="qg-header">
        <img src="/logoblack.png" alt="Logo" className="qg-logo" />
        <h3>Schedule Evaluation {lic ? `(LIC ID: ${lic})` : ""}</h3>
        
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

      {/* 🔹 Overlay: Session Missing */}
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

      {/* 🔹 Overlay: Logout Confirmation */}
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
    </>
  );
}

export default Nav;
