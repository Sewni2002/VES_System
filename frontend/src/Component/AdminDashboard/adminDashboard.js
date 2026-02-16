import React, { useState, useEffect, useRef } from 'react';
import axios from "axios";
import AddAdminForm from "./AddAdminForm";
import AddLICForm from "./AddLICForm";
import AddDeanForm from "./AddDeanForm"
import UpdateLICForm from "./UpdateLICForm";
import UpdateDeanForm from "./UpdateDeanForm";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
const [showAddAdminForm, setShowAddAdminForm] = useState(false);
const [activeMenu, setActiveMenu] = useState("Dashboard");

  const adminID = localStorage.getItem("adminID");
const [manageStudentOption, setManageStudentOption] = useState(""); // "addLIC", "addDean", "updateLIC", "updateDean"

  const [time, setTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
  
    const [lic, setLic] = useState(null);
    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  
    const [adminName, setAdminName] = useState("");


const refreshStats = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats");
    setStats(res.data);
  } catch (err) {
    console.error("Error refreshing dashboard stats", err);
  }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats");
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);


  // ✅ Prepare chart data
  const chartData = [
    { name: "Completed", value: stats.completedSessions || 0 },
    { name: "Not Completed", value: stats.notCompletedSessions || 0 },
    { name: "Dean Pending", value: stats.statusCounts?.pending || 0 },
    { name: "Dean Accepted", value: stats.statusCounts?.accepted || 0 },
    { name: "Dean Rejected", value: stats.statusCounts?.rejected || 0 },
  ];


  
    // Get licID from localStorage on mount
    useEffect(() => {
      const licID = localStorage.getItem("adminID");
      if (licID) {
        setLic(licID);
      
      } else {
        setShowSessionOverlay(true); // session missing → ask login
      }
    }, []);


useEffect(() => {
  const name = localStorage.getItem("adminName");
  if (name) setAdminName(name);
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
    <div className="admin-dashboard">



         <div className="qg-header">
        <img src="/logoblack.png" alt="Logo" className="qg-logo" />
        <h3>Admin Dashboard</h3>
        
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
onClick={() => {
  setShowLogoutOverlay(false);
  setActiveMenu("Dashboard");
}}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="profile-section">
          <img
            src="backgroundsisgnin.jpg"
            alt="Admin Avatar"
            className="avatar"
          />
          <h3>{adminName || "Admin"}</h3>
          <p>ID: {adminID}</p>
        </div>

  <ul className="menu">
  <li 
    className={activeMenu === "Dashboard" ? "active" : ""} 
    onClick={() => {
      setShowAddAdminForm(false);
      setActiveMenu("Dashboard");
    }}
  >
    Dashboard
  </li>
  <li 
    className={activeMenu === "Add Admin" ? "active" : ""} 
    onClick={() => {
      setShowAddAdminForm(true);
      setActiveMenu("Add Admin");
      setManageStudentOption("");
    }}
  >
    Add Admin
  </li>
  <li 
    className={activeMenu === "Manage Students" ? "active" : ""} 
onClick={() => { setActiveMenu("Manage Students"); setManageStudentOption(""); setShowAddAdminForm(false);}}  >
    Manage Users
  </li>
 
  <li 
    className={activeMenu === "Logout" ? "active" : ""} 
    onClick={() => {
      setActiveMenu("Logout");
      setShowLogoutOverlay(true);
    }}
  >
    Logout
  </li>
</ul>

      </aside>



      

      {/* Main Content */}
<main className="main-content">
  {showAddAdminForm ? (
    <AddAdminForm onClose={() => setShowAddAdminForm(false)} onAdminAdded={refreshStats} />
  ) : activeMenu === "Manage Students" ? (
    <div className="manage-students" style={{ display: "flex", gap: "20px" }}>
      {/* Left: Options */}
      <div className="options">
        <button onClick={() => setManageStudentOption("addLIC")}>Add LIC</button>
        <button onClick={() => setManageStudentOption("addDean")}>Add Dean</button>
        <button onClick={() => setManageStudentOption("updateLIC")}>Update LIC</button>
        <button onClick={() => setManageStudentOption("updateDean")}>Update Dean</button>
      </div>

      {/* Right: Form display */}
      <div className="form-display" style={{ flex: 1 }}>
        {manageStudentOption === "addLIC" && (
          <AddLICForm onClose={() => setManageStudentOption("")} onAdded={refreshStats} />
        )}
        {manageStudentOption === "addDean" && (
          <AddDeanForm onClose={() => setManageStudentOption("")} onAdded={refreshStats} />
        )}
        {manageStudentOption === "updateLIC" && (
  <UpdateLICForm onClose={() => setManageStudentOption("")} onUpdated={refreshStats} />
)}
{manageStudentOption === "updateDean" && (
  <UpdateDeanForm onClose={() => setManageStudentOption("")} onUpdated={refreshStats} />
)}

        {!manageStudentOption && (
          <div style={{ padding: "20px", color: "#555" ,marginTop:"90px"}}>
            <h3>Select an option on the left to manage Users</h3>
          </div>
        )}
      </div>
    </div>
  ) : (
    <>
        <header>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {adminName ? `(LIC ID: ${adminName})` : ""} 👋</p>
        </header>

        {/* === Student Stats === */}
      <section className="cards">
  <div className="card total">
    <h2>Total Students</h2>
    <p>{stats.totalStudents}</p>
  </div>

  {Object.entries(stats.semesterCounts || {}).map(([key, value]) => (
    <div key={key} className="card semester">
      <h3>{key.replace(/_/g, " ")}</h3>
      <p>{value}</p>
    </div>
  ))}

  <div className="card instructors">
    <h2>Total Instructors</h2>
    <p>{stats.totalInstructors}</p>
  </div>

  <div className="card submissions">
    <h2>Total Submissions</h2>
    <p>{stats.Totalsubmissions}</p>
  </div>
</section>


        {/* === Scheduler Stats Bar Chart === */}
        <section className="chart-section">
<h2 style={{ fontSize: "22px" }}>Scheduler Statistics Overview</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#086503" barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* === Upcoming Schedules === */}
        {/*<section className="upcoming-section">
          <h2>Upcoming Schedules</h2>
          <table className="upcoming-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Instructor</th>
                <th>Group</th>
                <th>Scheduled Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.upcomingSchedules && stats.upcomingSchedules.length > 0 ? (
                stats.upcomingSchedules.map((session, index) => (
                  <tr key={index}>
                    <td>{session.sessionId}</td>
                    <td>{session.instructorId}</td>
                    <td>{session.groupId}</td>
                    <td>{new Date(session.scheduledDateTime).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No upcoming sessions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>*/}


     <div className="report-generator">
  <h2 className="report-title">Generate Reports</h2>

  <div className="report-buttons">
    <button
      className="report-btn schedule"
      onClick={() =>
        window.open(
          `http://localhost:5000/api/admin/reports/schedule-pdf?adminID=${adminID}`,
          "_blank"
        )
      }
    >
      Generate Schedule PDF
    </button>

    <button
      className="report-btn feedback"
      onClick={() =>
        window.open(
          `http://localhost:5000/api/admin/reports/feedback-pdf?adminID=${adminID}`,
          "_blank"
        )
      }
    >
      Generate Feedback PDF
    </button>

    <button
      className="report-btn grouping"
      onClick={() =>
        window.open(
          `http://localhost:5000/api/admin/reports/grouping-pdf?adminID=${adminID}`,
          "_blank"
        )
      }
    >
      Generate Student Grouping PDF
    </button>
  </div>
</div>

        </>)}



        
      </main>
    </div>
  );
};

export default AdminDashboard;
