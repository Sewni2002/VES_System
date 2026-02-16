import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./StuDashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaComments } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StudentDashboard() {
  const studentID = localStorage.getItem("studentID");
  const [student, setStudent] = useState(null);
  const [scheduler, setScheduler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [fullMarks, setFullMarks] = useState(null);

const [showErrorOverlay, setShowErrorOverlay] = useState(false);

   const [menuOpen, setMenuOpen] = useState(false);
  
    const [lic, setLic] = useState(null);
    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();
  const mockVivaRef = useRef();

  useEffect(() => {
    if (!studentID) {
      setLoading(false);
      setError("No Student ID found in localStorage");
      return;
    }

    const fetchData = async () => {
      try {
        const studentRes = await axios.get(
          `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
        );
        setStudent(studentRes.data);

        const schedulerRes = await axios.get(
          `http://localhost:5000/api/SPviva-scheduler/viva/${studentID}`
        );
        setScheduler(schedulerRes.data.scheduler);

        const checklistRes = await axios.get(
          `http://localhost:5000/api/SPchecklist/${studentID}`
        );
        setChecklist(checklistRes.data.items);

        const annRes = await axios.get(
          "http://localhost:5000/api/SPannouncements/latest"
        );
        setAnnouncements(annRes.data);

        const feedbackRes = await axios.get(
          "http://localhost:5000/api/SPfeedback/all"
        );
        setFeedbacks(feedbackRes.data);

    try {
        const fmRes = await axios.get(
          `http://localhost:5000/api/SPfullmarks/fullmarks/${studentID}`
        );
        setFullMarks(fmRes.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // No record found → safe fallback
          setFullMarks(null);
        } else {
          console.error("Error fetching FullMarks:", error);
          setFullMarks(null);
        }
      }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch data");
        setLoading(false);
        setShowErrorOverlay(true); // show overlay if error occurs
      }
    };

    fetchData();
  }, [studentID]);

  // ✅ Scroll to #mock-viva when navigated with hash
  useEffect(() => {
    if (location.hash === "#mock-viva" && mockVivaRef.current) {
      setTimeout(() => {
        mockVivaRef.current.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [location]);

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

  const goToProfile = () => navigate("/profile");
  const goToDashboard = () => navigate("/studentdashboard");
  const goToAnnouncements = () => navigate("/announcements");
  const goToFeedback = () => navigate("/feedback");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isSameDay = (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDateClick = (date) => {
    if (scheduler && isSameDay(scheduler.scheduledDate, date)) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month" && scheduler) {
      return isSameDay(scheduler.scheduledDate, date)
        ? "viva-calendar-date"
        : null;
    }
  };

  const markDone = (index) => {
    axios
      .post("http://localhost:5000/api/SPchecklist/mark", { studentID, index })
      .then((res) => setChecklist(res.data.items))
      .catch((err) => console.error(err));
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Viva Preparation Progress Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Student ID: ${student?.studentID || "-"}`, 20, 40);
    doc.text(`Name: ${student?.iname || "-"}`, 20, 50);

    const rows = checklist.map((item, i) => [
      i + 1,
      item.title,
      item.done ? "Done" : "Pending",
      item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "-",
    ]);

    autoTable(doc, {
      startY: 65,
      head: [["#", "Task", "Status", "Completed Date"]],
      body: rows,
    });

    let doneCount = checklist.filter((i) => i.done).length;
    let feedback =
      "Keep working on pending tasks and stay consistent. Preparation is a journey, and steady progress will help you gain confidence.";
    if (doneCount === 10) {
      feedback =
        "Excellent! You have completed all preparations, which shows your dedication and discipline. Take a moment to feel proud of the effort you’ve invested so far. Now, focus on revising thoroughly to ensure all concepts are clear and fresh in your mind. Practice answering questions out loud, as if you were in the actual viva, to build confidence. Try to simulate tricky scenarios or unexpected questions so you are ready for anything. Maintain a positive mindset and trust your preparation. You are fully prepared, and this consistency will reflect strongly in your performance.";
    } else if (doneCount >= 7) {
      feedback =
        "Good progress! You have completed most of the tasks, and only a few remain to reach full readiness. Take a close look at the pending items and prioritize them to maximize your preparation. Review the tasks you have already completed to reinforce your understanding and retain key details. Practice speaking your answers confidently, focusing on clarity and accuracy, as this will help during your viva. Remember, even small steps every day bring you closer to full readiness. Keep a positive mindset and maintain steady effort; you’re almost there. Completing the remaining tasks will give you an extra boost of confidence and polish your performance.";
    } else {
      feedback =
        "Many tasks are still pending, so it is crucial to stay consistent and dedicate focused time each day. Break down your checklist into smaller, manageable steps and tackle them systematically. Don’t get discouraged by the workload; progress, even if slow, is better than none. Review previously completed tasks regularly to strengthen your understanding and retention. Practice explaining concepts aloud, as speaking confidently is just as important as knowing the answers. Keep a positive attitude, stay motivated, and remind yourself that every effort counts toward being ready. With persistence and dedication, you will complete your checklist and enter your viva fully prepared and confident.";
    }

    doc.text("Overall Feedback:", 20, doc.lastAutoTable.finalY + 20);
    doc.text(feedback, 20, doc.lastAutoTable.finalY + 30, { maxWidth: 170 });

    doc.save(`Viva_Report_${student?.studentID}.pdf`);
  };

  const doneCount = checklist.filter((i) => i.done).length;
  const pendingCount = checklist.length - doneCount;
  const checklistChartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        label: "Tasks",
        data: [doneCount, pendingCount],
        backgroundColor: ["#16a34a", "#e5e7eb"],
      },
    ],
  };

  const ratingCounts = [0, 0, 0, 0, 0];
  feedbacks.forEach((f) => {
    if (f.rating >= 1 && f.rating <= 5) ratingCounts[f.rating - 1]++;
  });
  const totalRatings = feedbacks.length;
  const avgRating =
    totalRatings > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings).toFixed(
          2
        )
      : 0;





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
      


         useEffect(() => {
            const licID = localStorage.getItem("studentID");
            if (licID) {
              setLic(licID);
            } else {
              setShowSessionOverlay(true); // session missing → ask login
            }
          }, []);
        
        const handleLogoutConfirm = () => {
          localStorage.removeItem("token");
          localStorage.removeItem("studentID");
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
    <div className="SP_dashboard_container">
      <div className="SP_body">
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

                 <h1
    className="SP_dashboard_heading"
    style={{
      margin: 0,
      fontSize: "1.2rem", // reduced size
      fontWeight: 600,
      whiteSpace: "nowrap",
      color: "#f6f6f6ff",
    }}
  >
    {loading ? "Loading..." : error ? error : `Welcome ${student?.iname},`}
  </h1>
              </div>
            )}

            {/* Navigation Buttons */}
            <button className="UF_link" onClick={goToDashboard}>
              Dashboard
            </button>
            <button className="UF_link" onClick={goToProfile}>
              Profile
            </button>
            <button className="UF_link" onClick={() => navigate("/upload")}>
              Upload Files
            </button>

           

            <button className="UF_link" onClick={() => navigate("/groupchat")}>
              Team Chat
            </button>
            <button className="UF_link" onClick={goToAnnouncements}>
              Announcement Panel
            </button>
            <button className="UF_link" onClick={() => navigate("/absence")}>
              Absence Request Form
            </button>
                <button className="UF_link" onClick={() => setShowLogoutOverlay(true)}>Logout</button>

            
          </div>

          {/* Main content */}
          <div className="SP_dashboard_main">
            <div
              className="SP_notification_bell"
              ref={dropdownRef}
              style={{ position: "absolute", top: "81px", left: "350px", zIndex: 9999 }}
            >
              <button
                className="SP_bell_icon running_bell"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                🔔
              </button>
              {showDropdown && (
                <div className="SP_notification_dropdown floating_dropdown">
                  <h4>Announcements</h4>
                  <ul>
                    {announcements.length > 0 ? (
                      announcements.map((a, i) => (
                        <li key={i}>
                          <strong>{a.title}</strong>
                          <br />
                          <small>{new Date(a.createdAt).toLocaleDateString()}</small>
                        </li>
                      ))
                    ) : (
                      <li>No announcements</li>
                    )}
                  </ul>
                  <button className="SP_see_all_btn" onClick={goToAnnouncements}>
                    See All
                  </button>
                </div>
              )}
            </div>
<div
  className="SP_dashboard_header"
  style={{
    marginBottom: "3rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // space between left, center, right
    position: "relative",
  }}
>
  {/* Left: Team Chat button */}
  <div className="SP_group_chat_btn" onClick={() => navigate("/groupchat")}>
    <FaComments size={18} style={{ marginRight: "8px" }} />
    Team Chat
  </div>

  {/* Center: Logo */}
  <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
    <img
      src="/logoblack.png"
      alt="Logo"
      style={{
        height: "60px",
        objectFit: "contain",
      }}
    />
  </div>

  {/* Optional right placeholder to balance space */}
  <div style={{ width: "120px" }}></div>
</div>



           
            {/* ⭐ Mock Viva Content Box */}
            <div
              id="mock-viva"
              className="SP_mock_viva_box"
              ref={mockVivaRef}
              style={{
                marginBottom: "0.1rem",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#f5f5f5",
              }}
            >
              <h2>Mock Viva Test</h2>
              <p>
                You can get an experience for your actual viva exam by attempting this mock viva exam.
                Each student is allowed <strong>3 attempts</strong>. Every attempt will give new questions
                so you can practice thoroughly.
              </p>
              <p>
                Take your time to attempt each question thoughtfully, and review feedback
                after each attempt to improve. Click the button below to start your mock viva test.
              </p>
              <button className="SP_dashboard_button" onClick={() => navigate("/mockviva")}>
                Start Quiz
              </button>
            </div>

            {fullMarks && (
  <div
    className="SP_viva_exam_box"
    style={{
      marginTop: "1.5rem",
      padding: "40px",
      border: "1px solid #ddd",
      borderRadius: "12px",
      background: "#f5f5f5",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "30px",
    }}
  >
    {/* Left Section (text + buttons) */}
    <div style={{ flex: 1 }}>
      <h2>Viva Exam</h2>
      <p>To start your viva exam, click the button below.</p>
      <a
        href={fullMarks.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <button className="SP_dashboard_button">Start Exam</button>
      </a>

      <p style={{ marginTop: "1.5rem" }}>
        To view your viva exam results, click below.
      </p>
     {fullMarks && fullMarks.resultLink ? (
  <a
    href={fullMarks.resultLink}
    target="_blank"
    rel="noopener noreferrer"
  >
    <button className="SP_dashboard_button">View Results</button>
  </a>
) : (
  <p style={{ color: "gray", fontStyle: "italic" }}>
    Yet marks are not allocated
  </p>
)}

    </div>

    {/* Right Section (QR Code) */}
    {fullMarks.qrCode && (
      <div
        style={{
          textAlign: "center",
          minWidth: "150px",
        }}
      >
        <h4>QR Code</h4>
        <img
          src={fullMarks.qrCode}
          alt="QR Code"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "contain",
            marginTop: "0.5rem",
          }}
        />
      </div>
    )}
  </div>
)}


            {/* Remaining content unchanged */}
            {scheduler && (
              <div className="viva_calendar_container">
                <h2>Viva Calendar</h2>
                <Calendar
                  onClickDay={handleDateClick}
                  tileClassName={tileClassName}
                  className="react-calendar"
                  nextLabel=">"
                  prevLabel="<"
                />
                {selectedDate && (
                  <div className="SP_viva_details">
                    <h3>Viva Details - {selectedDate.toDateString()}</h3>
                    <p><strong>Project Topic:</strong> {scheduler.topic || "-"}</p>
                    <p><strong>Time:</strong> {scheduler.scheduledDate ? new Date(scheduler.scheduledDate).toLocaleTimeString() : "-"}</p>
                    <p><strong>Venue (Hall):</strong> {scheduler.hall || "-"}</p>
                    <p><strong>Instructor:</strong> {scheduler.instructor || "-"}</p>
                    {scheduler.substituteInstructor && <p><strong>Substitute Instructor:</strong> {scheduler.substituteInstructor}</p>}
                    {scheduler.notes && <p><strong>Notes:</strong> {scheduler.notes}</p>}
                  </div>
                )}
              </div>
            )}

            <div className="SP_viva_checklist">
              <h2>Viva Preparation Checklist</h2>
              <ul>
                {checklist.map((item, i) => (
                  <li key={i}>
                    <span>{item.title}</span>
                    {item.done ? (
                      <button className="SP_done_btn">Done ✔</button>
                    ) : (
                      <button className="SP_todo_btn" onClick={() => markDone(i)}>
                        To Do
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <button className="SP_report_btn" onClick={generateReport}>
                📄 Generate Report
              </button>
              <div style={{ marginTop: "20px" }}>
                <h3>Your Progress</h3>
                <Bar data={checklistChartData} />
              </div>
            </div>

            <div
              className="SP_feedback_summary"
              style={{
                marginTop: "3rem",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#fafafa",
              }}
            >
              <h2>Student Feedback Summary</h2>
              <p>Rated 5 out of 5 based on {totalRatings} feedbacks</p>
              <div style={{ marginTop: "15px" }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star - 1];
                  const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                  const colors = { 5: "green", 4: "dodgerblue", 3: "gold", 2: "orange", 1: "red" };
                  return (
                    <div
                      key={star}
                      style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
                    >
                      <span style={{ width: "50px" }}>{star} star</span>
                      <div
                        style={{
                          flex: 1,
                          height: "14px",
                          background: "#eee",
                          borderRadius: "8px",
                          margin: "0 10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: "100%",
                            background: colors[star],
                          }}
                        ></div>
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
              <button
                className="SP_dashboard_button"
                style={{ marginTop: "30px" }}
                onClick={goToFeedback}
              >
                <span>Give Us Your Feedback</span>
              </button>

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


{/* 🔹 Overlay: Student Not Assigned to Group */}
{showErrorOverlay && (
  <div style={overlayStyle}>
    <div style={cardStyle}>
      <img src="/logoblack.png" alt="VES Logo" style={imageStyle} />
      <h2 style={{ marginBottom: "10px" }}>Important Notice</h2>
      <p style={{ color: "#444", marginBottom: "20px", lineHeight: "1.6" }}>
        Dear Student <strong>{studentID}</strong>,<br /><br />
        It appears that you have not yet been assigned to any project group by the 
        <strong> Lecture In-Charge (LIC)</strong> of your module.<br /><br />
        Please check back later once your LIC finalizes group allocations.
      </p>
      <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "25px" }}>
        — Message from the <strong>VES Evaluation Team</strong>
      </p>
      <button
        style={{ ...buttonStyle, background: "#0ea5e9", color: "#fff" }}
        onClick={() => {
          setShowErrorOverlay(false);
          navigate("/login");
        }}
      >
        Go to Login
      </button>
    </div>
  </div>
)}

            </div>

                <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
