import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ phone: "", profilePic: "" });
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!studentID) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/SPstudentRoute/student/${studentID}`);
        const data = res.data;

        setStudent(data);
        setFormData({
          phone: data.phone || "",
          profilePic: data.photo || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Fetch student error:", err);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentID]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePic: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const saveChanges = async () => {
    try {
      const payload = {};
      if (formData.phone !== student.phone) payload.phone = formData.phone;
      if (formData.profilePic && formData.profilePic.startsWith("data:")) {
        payload.profilePic = formData.profilePic;
      }

      if (Object.keys(payload).length === 0) {
        alert("No changes detected!");
        return;
      }

      const res = await axios.put(`http://localhost:5000/api/SPstudentRoute/student/${studentID}`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      setStudent(res.data);
      setFormData({
        phone: res.data.phone || "",
        profilePic: res.data.photo || "",
      });

      setEditMode(false);
      setFileName("");
      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.response || err);
      alert("❌ Failed to update profile. Check backend route exists and server logs.");
    }
  };

    const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

    const goToDashboard = () => navigate("/studentdashboard");
  const goToProfile = () => navigate("/profile");

  if (loading) return <p>Loading student data...</p>;
  if (!student) return <p>No student data available.</p>;

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
      <div className="SP_dashboard_main">
        <div className="SP_profile_container">
          <div className="SP_profile_card">
            <h1 className="SP_profile_title">👤 My Profile</h1>

           <img
  src={
    formData.profilePic
      ? formData.profilePic
      : student.photo
      ? `http://localhost:5000/studentimages/${student.photo}`
      : "/default-avatar.png"
  }
  alt="Profile"
  className="SP_profile_pic"
  style={{
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "1rem",
  }}
  onError={(e) => {
    // Fallback if the server URL fails
    if (student.photo) e.target.src = student.photo;
    else e.target.src = "/default-avatar.png";
  }}
/>


            {editMode && (
              <>
                <input
                  id="profileFile"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <label htmlFor="profileFile" className="SP_upload_btn">
                  Change Profile Picture
                </label>
                {fileName && (
                  <div className="SP_selected_file">
                    Selected: <strong>{fileName}</strong>
                  </div>
                )}
              </>
            )}

            <ul className="SP_profile_info">
              <li>
                <strong>Student ID:</strong> {student.studentID || "-"}
              </li>
              <li>
                <strong>Name:</strong> {student.iname || student.fname || "-"}
              </li>
              <li>
                <strong>Email:</strong> {student.email || "-"}
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                {editMode ? (
                  <input
                    className="SP_profile_input"
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                ) : (
                  student.phone || "-"
                )}
              </li>
              <li>
                <strong>Faculty:</strong> {student.faculty || "-"}
              </li>
              <li>
                <strong>Payment Status:</strong> {student.payment_status ? "Paid" : "Pending"}
              </li>
              <li>
                <strong>Academic Status:</strong> {student.academic_status || "-"}
              </li>
              <li>
                <strong>Viva Status:</strong> {student.vivaregstatus ? "Registered" : "Not Registered"}
              </li>
            </ul>

            <button className="SP_profile_btn" onClick={() => setEditMode((m) => !m)}>
              {editMode ? "Cancel" : "Edit Profile"}
            </button>

            {editMode && (
              <button className="SP_profile_btn" onClick={saveChanges}>
                Save Changes
              </button>
            )}

            <button className="SP_profile_btn" onClick={() => navigate("/grp-profile")}>
              Group Profile
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

export default ProfilePage;
