import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./UploadFiles.css";
import "./StuDashboard.css";
import StudentZipSubmissionForm from './StudentZipSubmissionForm';

export default function UploadFiles()  {
    const navigate = useNavigate();

  const studentID = localStorage.getItem("studentID"); // ✅ Get student ID from localStorage
  const [student, setStudent] = useState(null);

  const [formData, setFormData] = useState({
    studentID: studentID || "",
    code: "",
    languageType: "",
    module: "",
  });
  const [loading, setLoading] = useState(true);

  const [group, setGroup] = useState(null);

  const [language, setLanguage] = useState("Java");
  const [scope, setScope] = useState("backend");
  const [notes, setNotes] = useState("");
  const [textFileContent, setTextFileContent] = useState("");
  const [zipFiles, setZipFiles] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [afterDeadline, setAfterDeadline] = useState(false);
  const [moduleCode, setModuleCode] = useState("");

  const [announcements, setAnnouncements] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  const [activeForm, setActiveForm] = useState("code"); // "code" or "zip"

  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch submissions of the logged-in student
  const fetchSubmissions = async () => {
    if (!studentID) return;
    try {
      const res = await axios.get("http://localhost:5000/api/frontstudentSubmission");
      const studentSubs = res.data.filter((s) => s.studentID === studentID);
      setSubmissions(studentSubs);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  
  useEffect(() => {
    if (studentID) fetchSubmissions();
  }, [studentID]);

  // ✅ Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };




 useEffect(() => {
    if (!studentID) {
      alert("No studentID found. Login required.");
      navigate("/login");
      return;
    }

    const fetchAll = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
        );
        setStudent(res.data);

        const groupRes = await axios.get(
          `http://localhost:5000/api/SPstudentGroup/group-by-student/${studentID}`
        );
        const fetchedGroup = groupRes.data.group;
        setGroup(fetchedGroup);

    if (fetchedGroup?.gid) {
  const module = fetchedGroup.gid.split("-")[0]; // 'IT2030'
  setModuleCode(module);
  setFormData(prev => ({ ...prev, module })); // <-- sync formData.module
}


        try {
          const annRes = await axios.get(
            "http://localhost:5000/api/SPannouncements/latest"
          );
          setAnnouncements(annRes.data);
        } catch {
          setAnnouncements([]);
        }



        setEditingId(null);
      } catch (err) {
        console.error("fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [studentID, navigate]);


  
  // ✅ Add or update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // 🔁 Update submission
        const res = await axios.put(
          `http://localhost:5000/api/frontstudentSubmission/update/${editingId}`,
          {
            code: formData.code,
            languageType: formData.languageType,
            module: formData.module,
          }
        );
alert(res.data.message);
        setEditingId(null);
      } else {
        // ➕ Add new submission
        const res = await axios.post(
          "http://localhost:5000/api/frontstudentSubmission/add",
          formData
        );
        setMessage(res.data.message);
      }

      setFormData({ ...formData, code: "", languageType: "", module: "" });
      fetchSubmissions();
    } catch (err) {
alert(err.response?.data?.message || "Error submitting");
    }
  };

  // ✅ Edit submission
  const handleEdit = (submission) => {
    setFormData({
      studentID: submission.studentID,
      code: submission.code,
      languageType: submission.languageType,
      module: moduleCode,
    });
    setEditingId(submission._id);
  };

  // ✅ Delete submission
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        const res = await axios.delete(
          `http://localhost:5000/api/frontstudentSubmission/delete/${id}`
        );
        setMessage(res.data.message);
        fetchSubmissions();
      } catch (err) {
        setMessage("Error deleting submission");
      }
    }
  };

  return (


    <div className="SP_upload_container">
      <div className="SP_uf_body">
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
            <h2 className="UF_sidebar_title" style={{ margin: 0, fontSize: "1.2rem" }}>
              Student Dashboard
            </h2>

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
          <div className="submission-toggle-wrapper" >



 <div className="submission-toggle-buttons_unique_002">
    <button
      className={activeForm === "code" ? "active-toggle-btn_unique_004" : "toggle-btn_unique_003"}
      onClick={() => setActiveForm("code")}
    >
      Code Submission
    </button>
    <button
      className={activeForm === "zip" ? "active-toggle-btn_unique_004" : "toggle-btn_unique_003"}
      onClick={() => setActiveForm("zip")}
    >
      ZIP Submission
    </button>
  </div>

        <div className="submission-content">
   {activeForm === "code" && (
    <div className="code-submission-container_unique_005">
    <h2 style={{fontSize:"1.5rem"}}>Student Code Submission</h2>

    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="studentID"
        value={formData.studentID}
        readOnly
      />
<input
  type="text"
  name="module"
  placeholder="Module Code (e.g. IT2030)"
  value={formData.module}        // bind to formData
  onChange={handleChange}        // allow edits
  required
/>

      <select
        name="languageType"
        value={formData.languageType}
        onChange={handleChange}
        required
      >
        <option value="">-- Select Language --</option>
        <option value="Java">Java</option>
        <option value="JavaScript">JavaScript</option>
        <option value="Python">Python</option>
        <option value="C">C</option>
        <option value="C++">C++</option>
        <option value="C#">C#</option>
        <option value="PHP">PHP</option>
      </select>

      <textarea
        name="code"
        placeholder="Enter your code here"
        value={formData.code}
        onChange={handleChange}
        required
        rows={6}
      />

      <button type="submit" className="submit-btn">
        {editingId ? "Update Submission" : "Submit"}
      </button>
    </form>

    
    {submissions.length > 0 && (
      <div>
        <h3>Your Submissions</h3>
      <table className="submissions-table_unique_008">
          <thead>
            <tr>
              <th>Module</th>
              <th>Language</th>
              <th>Code Snippet</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.module}</td>
                <td>{sub.languageType}</td>
                <td>
                  <pre>{sub.code.slice(0, 80)}...</pre>
                </td>
                <td>{new Date(sub.dateSubmit).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleEdit(sub)}
                    className="edit-btn"
                    style={{marginBottom:"5px"}}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sub._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


      {activeForm === "zip" && (
        <div className="zip-submission-container">
          <StudentZipSubmissionForm />
        </div>
      )}
      </div>
        </div>

      
    
            </div>
             <div className="qg-footer" style={{ height: "47px", paddingTop: "14px" }}>
            &copy; 2025 VES System. All rights reserved.
          </div>

                </div>
                    
    </div>
  );
}
