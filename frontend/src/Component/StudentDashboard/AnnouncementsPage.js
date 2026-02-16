import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StuDashboard.css";

function AnnouncementsPage() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [student, setStudent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch student info and announcements
  useEffect(() => {
    if (!studentID) {
      setLoading(false);
      setError("No Student ID found in localStorage");
      return;
    }

    const fetchStudent = async () => {
      try {
        const studentRes = await axios.get(
          `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
        );
        setStudent(studentRes.data);

        const annRes = await axios.get(
          "http://localhost:5000/api/SPannouncements/all"
        );
        setAnnouncements(annRes.data);
        setFilteredAnnouncements(annRes.data);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentID]);

  // Live search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAnnouncements(announcements);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
    );
    setFilteredAnnouncements(filtered);
  }, [searchQuery, announcements]);

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
          gap: "0.5rem",
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
      <div className="SP_dashboard_main">
        <h1>All Announcements</h1>

        {/* 🔍 Search Bar */}
        <div className="SP_searchbar_container">
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="SP_searchbar_input"
          />
        </div>

        {/* Announcements List */}
        <ul className="SP_announcement_list">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((a, i) => (
              <li key={i} className="SP_notification_item">
                <h3 className="SP_announcement_title">{a.title}</h3>
                <p className="SP_announcement_desc">{a.description}</p>
                <small className="SP_announcement_date">
                  Posted on: {new Date(a.createdAt).toLocaleString()}
                </small>
              </li>
            ))
          ) : (
            <p>No announcements found.</p>
          )}
        </ul>
      </div>
       <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
}

export default AnnouncementsPage;
