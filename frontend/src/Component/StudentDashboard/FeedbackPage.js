import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StuDashboard.css"; 

function FeedbackPage() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [student, setStudent] = useState(null);
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const dropdownRef = useRef();
  const [showDropdown, setShowDropdown] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch student details and announcements
  useEffect(() => {
    if (!studentID) return;

    const fetchData = async () => {
      try {
        const studentRes = await axios.get(
          `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
        );
        setStudent(studentRes.data);

        const annRes = await axios.get(
          "http://localhost:5000/api/SPannouncements/latest"
        );
        setAnnouncements(annRes.data);

        // check if feedback submitted
        const feedbackRes = await axios.get(
          "http://localhost:5000/api/SPfeedback/all"
        );
        const existing = feedbackRes.data.find((f) => f.studentID === studentID);
        if (existing) setSubmitted(true);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setFetchError("Failed to fetch student data");
        setLoading(false);
      }
    };

    fetchData();
  }, [studentID]);

  // Close announcement dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToProfile = () => navigate("/profile");
  const goToDashboard = () => navigate("/studentdashboard");
  const goToAnnouncements = () => navigate("/announcements");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comments) {
      setError("Please write your feedback");
      return;
    }
    axios
      .post("http://localhost:5000/api/SPfeedback/submit", {
        studentID,
        rating,
        comments,
        questions,
      })
      .then(() => {
        alert("Feedback submitted. Thank you!");
        navigate("/studentdashboard");
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to submit feedback");
      });
  };

  if (loading) return <p>Loading...</p>;
  if (fetchError) return <p style={{ color: "red" }}>{fetchError}</p>;
  if (submitted)
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




        <div className="SP_dashboard_main" style={{ padding: "20px" }}>
          <h2>You have already submitted feedback. Thank you!</h2>
         <button
  onClick={() => navigate("/studentdashboard")}
  style={{
    backgroundColor: "#000000ff",   // bright blue accent
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#037a25ff")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#000000ff")}
>
  Back to Dashboard
</button>

        </div>
      </div>
    );

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
  <button
    className="UF_link"
    onClick={() => navigate("/studentdashboard#mock-viva")}
  >
    Mock Viva Test
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
      <div className="SP_dashboard_main" style={{ padding: "30px" }}>
        <h2 style={{ marginLeft: "350px" }}>Student Feedback</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit} className="SP_form">
          <label>Rating (1 to 5):</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <label>Comments:</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows="4"
            placeholder="Write your feedback here"
            required
          />

          <label>Additional Questions / Suggestions:</label>
          <textarea
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            rows="3"
            placeholder="Any questions or suggestions"
          />

          <button type="submit" className="button" style={{ marginTop: "10px" }}>
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackPage;
