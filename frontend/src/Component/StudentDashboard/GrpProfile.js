import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function GrpProfile() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const roles = ["Leader", "Member", "Designer", "Tester", "Frontend", "Backend"];

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        if (!studentID) {
          setErrorMessage("No student ID available.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/SPstudentGroup/group-by-student/${studentID}`
        );

        setGroup(res.data.group || null);
        setMembers(res.data.members || []);
        setMemberRoles(res.data.memberRoles || []);
        setLoading(false);
      } catch (err) {
        console.error("Group fetch error:", err?.response?.data || err.message);
        setErrorMessage(err.response?.data?.error || "Failed to fetch group data.");
        setLoading(false);
      }
    };
    fetchGroup();
  }, [studentID]);

  const handleRoleChange = (studentID, selectedRole) => {
    setMemberRoles(prev => {
      const updated = [...prev];
      const index = updated.findIndex(m => m.studentID === studentID);
      if (index !== -1) updated[index].role = selectedRole;
      else updated.push({ studentID, name: members.find(m => m.studentID === studentID)?.name || "", role: selectedRole });
      return updated;
    });
  };

  const saveRoles = async () => {
    try {
      if (!group?.gid) return;
      await axios.post(`http://localhost:5000/api/SPstudentGroup/assign-roles/${group.gid}`, { roles: memberRoles });
      alert("Roles saved successfully!");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to save roles");
    }
  };

  if (loading) return <p>Loading group data...</p>;
  if (errorMessage) return <p style={{ color: "crimson" }}>{errorMessage}</p>;
  if (!group) return <p>No group assigned yet.</p>;

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
        <h2 className="UF_sidebar_title" style={{ margin: 0, fontSize: "1.2rem" }}>
          Student Dashboard
        </h2>
        <div className="SP_sidebar_profile">
          <p className="SP_sidebar_name">Group Profile</p>
        </div>
        <button className="UF_link" onClick={() => navigate("/studentdashboard")}>Dashboard</button>
        <button className="UF_link" onClick={() => navigate("/profile")}>Profile</button>
        <button className="UF_link" onClick={() => navigate("/upload")}>Upload Files</button>
       
        <button className="UF_link" onClick={() => navigate("/groupchat")}>Team Chat</button>
        <button className="UF_link" onClick={() => navigate("/announcements")}>Announcement Panel</button>
        <button className="UF_link" onClick={() => navigate("/absence")}>Absence Request Form</button>
        <button className="UF_link" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="SP_dashboard_main" style={{ marginLeft: "250px", padding: "2rem" }}>
        <div className="SP_profile_container">
          <div
            className="SP_profile_card"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(15px)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
            }}
          >
            <h1 className="SP_profile_title" style={{ marginBottom: "1.5rem" }}>👥 Group Profile</h1>
            <ul className="SP_profile_info" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li style={{ marginBottom: "0.8rem" }}><strong>Group Topic:</strong> {group.groupTopic || "-"}</li>
              <li style={{ marginBottom: "0.8rem" }}><strong>Group ID:</strong> {group.gid || "-"}</li>
              <li>
                <strong>Members & Roles:</strong>
                <ul className="SP_profile_group" style={{ listStyle: "none", padding: "0.5rem 0" }}>
                  {members?.length > 0 ? members.map((m, index) => (
                    <div
                      key={index}
                      className="SP_member-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginBottom: "10px",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>
                        {m.name ? `${m.name} (${m.studentID})` : `${m.studentID}`}
                      </span>
                      <select
                        value={memberRoles.find(r => r.studentID === m.studentID)?.role || ""}
                        onChange={(e) => handleRoleChange(m.studentID, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1px solid #64748b",
                          background: "#ffffff",
                          color: "#0f172a",
                          fontWeight: 500,
                          minWidth: "120px",
                          cursor: "pointer"
                        }}
                      >
                        <option value="">Select Role</option>
                        {roles.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  )) : <p>No members assigned</p>}
                </ul>
              </li>
            </ul>

            <button
              className="SP_profile_btn"
              onClick={saveRoles}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#16a34a",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Save Roles
            </button>

            <button
              className="SP_profile_btn"
              onClick={() => navigate("/profile")}
              style={{
                marginTop: "1.5rem",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Back to Profile
            </button>
          </div>
        </div>
            <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
      </div>
    </div>
  );
}

export default GrpProfile;
