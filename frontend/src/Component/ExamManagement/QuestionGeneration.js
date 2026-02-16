import React, { useEffect, useState ,useRef} from "react";
import axios from "axios";
import "./QuestionGeneration.css";
import jsPDF from "jspdf";

const QuestionGeneration = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [summary, setSummary] = useState(""); 
  const [showCodeModal, setShowCodeModal] = useState(false); 
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
const [showSavedQuestionsModal, setShowSavedQuestionsModal] = useState(false);
const [savedQuestions, setSavedQuestions] = useState([]);
const [showDownloadModal, setShowDownloadModal] = useState(false);

const [searchTerm, setSearchTerm] = useState("");
const [time, setTime] = useState(new Date());
const [menuOpen, setMenuOpen] = useState(false);
const [showIndividualModal, setShowIndividualModal] = useState(false);
const [studentIndex, setStudentIndex] = useState("");
  const [instructorID, setInstructorID] = useState("");



   
      const dropdownRef = useRef(null);
    
      const [showSessionOverlay, setShowSessionOverlay] = useState(false);
      const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
    


useEffect(() => {
  const handleClickOutside = (event) => {
    const dropdown = document.querySelector(".dropdown");
    if (dropdown && !dropdown.contains(event.target)) {
      setMenuOpen(false); // close menu only if clicked truly outside
    }
  };
  document.addEventListener("click", handleClickOutside);
  return () => {
    document.removeEventListener("click", handleClickOutside);
  };
}, []);


const toggleMenu = () => setMenuOpen((prev) => !prev);
useEffect(() => {
  const timer = setInterval(() => setTime(new Date()), 1000);
  return () => clearInterval(timer);
}, []);


  // New state for 3-level questions
  const [questionsByLevel, setQuestionsByLevel] = useState({
    Easy: [],
    Intermediate: [],
    Advanced: []
  });

  // Levels array
  const levels = ["Easy", "Intermediate", "Advanced"];

  // Editing state
  const [editing, setEditing] = useState({ level: null, idx: null });
  const [tempQuestion, setTempQuestion] = useState({ question: "", options: ["","","","",""], correct: "A" });

  //get the submission of students
 useEffect(() => {
  const fetchSubmissions = async () => {
    try {
      const instructorID = localStorage.getItem("instructorID");
      setInstructorID(instructorID)
      const res = await axios.get(`http://localhost:5000/api/studentsubmission?instructorId=${instructorID}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    }
  };
  fetchSubmissions();
}, []);


  const handleSelectStudent = async (submission) => {
    setSelectedStudent(submission);
    setSummary("");
    setShowCodeModal(false);
    setQuestionsByLevel({ Easy: [], Intermediate: [], Advanced: [] });

    if (!submission.code) return;

    setLoadingSummary(true);
    try {
      const res = await fetch("http://localhost:5000/summarize-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: submission.code,
          language: submission.languageType,
        }),
      });
      const data = await res.json();
      setSummary(data.summary || "No summary available.");
    } catch (error) {
      console.error("Error fetching summary:", error);
      setSummary("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedStudent) return;

    setLoadingQuestions(true);
    setQuestionsByLevel({
      Easy: [{ question: "Generating...", options: [], correct: "" }],
      Intermediate: [{ question: "Generating...", options: [], correct: "" }],
      Advanced: [{ question: "Generating...", options: [], correct: "" }]
    });

    try {
      const res = await fetch("http://localhost:5000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code: selectedStudent.code, 
          language: selectedStudent.languageType, 
          questionsPerLevel: 4 //controls the no of questions
        }),
      });

      const data = await res.json();

      setQuestionsByLevel({
        Easy: data.Easy || [],
        Intermediate: data.Intermediate || [],
        Advanced: data.Advanced || []
      });

    } catch (err) {
      console.error(err);
      setQuestionsByLevel({
        Easy: [],
        Intermediate: [],
        Advanced: []
      });
    } finally {
      setLoadingQuestions(false);
    }
  };




  // Function to fetch saved questions from DB
const fetchSavedQuestions = async () => {
  if (!selectedStudent) return;
  try {
    const res = await fetch(`http://localhost:5000/api/questions/get-questions/${selectedStudent.studentID}`);
    const data = await res.json();
    if (data.success) {
      setSavedQuestions(data.questions || []);
      setShowSavedQuestionsModal(true);
    } else {
      alert("❌ No saved questions found.");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error fetching saved questions.");
  }
};



  // Actions for questions
  const handleDeleteQuestion = (level, idx) => {
    setQuestionsByLevel(prev => {
      const updated = [...prev[level]];
      updated.splice(idx, 1);
      return { ...prev, [level]: updated };
    });
  };

  //question Order
  const handleMoveQuestion = (level, idx, direction) => {
    setQuestionsByLevel(prev => {
      const updated = [...prev[level]];
      const newIndex = idx + direction;
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      [updated[idx], updated[newIndex]] = [updated[newIndex], updated[idx]];
      return { ...prev, [level]: updated };
    });
  };

  const handleRegenerateQuestion = async (level, idx) => {
    if (!selectedStudent) return;

  setLoadingQuestions(true); 
    
    
    const code = selectedStudent.code;
    const language = selectedStudent.languageType;

    try {
      const res = await fetch("http://localhost:5000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, questionsPerLevel: 1 }),
      });
      const data = await res.json();
      const newQuestion = data[level][0];
      setQuestionsByLevel(prev => {
        const updated = [...prev[level]];
        updated[idx] = newQuestion;
        return { ...prev, [level]: updated };
      });


      
    } catch (error) {
      console.error(error);
      alert("Failed to regenerate question.");
    }finally {
    setLoadingQuestions(false); // Hide loading overlay
  }
  };
const handleSaveQuestions = async () => {
  if (!selectedStudent) return;

  try {
    const res = await fetch("http://localhost:5000/api/questions/save-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: selectedStudent.studentID,
        groupId: selectedStudent.groupID,
        questionsByLevel,
      }),
    });

    const data = await res.json();

if (data.success) {
  alert("✅ Questions successfully saved!");

  // update selected student
      setSelectedStudent((prev) => ({
        ...prev,
        questionGenerate: true,
      }));

      // update submissions list (sidebar)
      setSubmissions((prev) =>
        prev.map((s) =>
          s.studentID === selectedStudent.studentID
            ? { ...s, questionGenerate: true }
            : s
        )
      );

      // clear generated questions if you want
      setQuestionsByLevel({ Easy: [], Intermediate: [], Advanced: [] });
}

  } catch (err) {
    console.error(err);
    alert("❌ Error saving questions.");
  }
};

  // Inline edit functions
  const startEditing = (level, idx) => {
    const q = questionsByLevel[level][idx];
    setEditing({ level, idx });
    setTempQuestion({ question: q.question, options: [...q.options], correct: q.correct });
  };

  const saveEdit = () => {
    const { level, idx } = editing;
    setQuestionsByLevel(prev => {
      const updated = [...prev[level]];
      updated[idx] = { ...tempQuestion };
      return { ...prev, [level]: updated };
    });
    setEditing({ level: null, idx: null });
  };

  const cancelEdit = () => {
    setEditing({ level: null, idx: null });
  };





//generating reports

const handleDownloadAllQuestions = async (format = "csv") => {
  setShowDownloadModal(false);

  try {
    const res = await fetch("http://localhost:5000/api/questions/all");
    const data = await res.json();

    if (!data.success || !data.questions || data.questions.length === 0) {
      alert("❌ No saved questions found.");
      return;
    }

    // Group questions by studentId + groupId
    const groupedByStudent = {};
    data.questions.forEach((q) => {
      const studentId = q.studentId || "Unknown";
      const groupId = q.groupId || "Unknown";
      const key = `${studentId}_${groupId}`;
      if (!groupedByStudent[key]) groupedByStudent[key] = [];
      groupedByStudent[key].push(q);
    });

    if (format === "pdf") {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = "/logoblack.png"; // Path to your logo

      logo.onload = () => {
        doc.addImage(logo, "PNG", 80, 10, 50, 15); // Logo position and size
        let y = 30;

        Object.keys(groupedByStudent).forEach((studentKey) => {
          const studentQuestions = groupedByStudent[studentKey];

          // Sort by level & questionId
          const levelOrder = { Easy: 1, Intermediate: 2, Advanced: 3 };
          studentQuestions.sort((a, b) => {
            const levelA = levelOrder[a.level] || 99;
            const levelB = levelOrder[b.level] || 99;
            if (levelA !== levelB) return levelA - levelB;
            return a.questionId.localeCompare(b.questionId);
          });

          // Add header per student
          const [studentId, groupId] = studentKey.split("_");
          if (y > 270) { doc.addPage(); y = 10; }
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(`Student: ${studentId}   Group: ${groupId}`, 10, y);
          y += 10;

          //assigned varibles is given to doc and break down into pages
          studentQuestions.forEach((q, idx) => {
            if (y > 270) { doc.addPage(); y = 10; }

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`${idx + 1}. (${q.questionId}) [${q.level} Level]`, 10, y);
            y += 6;

            // Question
            const splitQuestion = doc.splitTextToSize(q.question || "", 180);
            doc.text(`Q: ${splitQuestion}`, 10, y);
            y += splitQuestion.length * 6;

            // Options
            if (Array.isArray(q.options)) {
              q.options.forEach((opt, i) => {
                if (y > 270) { doc.addPage(); y = 10; }
                const letter = String.fromCharCode(65 + i);
                doc.text(`${letter}. ${opt}`, 15, y);
                y += 6;
              });
            }

            // Correct answer
            if (y > 270) { doc.addPage(); y = 10; }
            doc.setFont("helvetica", "bold");
            doc.text(`Correct Answer: ${q.correct || "N/A"}`, 10, y);
            y += 10;
            doc.setFont("helvetica", "normal");
          });
        });

        doc.save("All_Questions.pdf");
      };
    }else if (format === "csv") {
      let csvContent = "QuestionID,StudentID,GroupID,Level,Question,Options,Correct\n";

      Object.keys(groupedByStudent).forEach((studentKey) => {
        const studentQuestions = groupedByStudent[studentKey];

        // Sort by level & questionId
        const levelOrder = { Easy: 1, Intermediate: 2, Advanced: 3 };
        studentQuestions.sort((a, b) => {
          const levelA = levelOrder[a.level] || 99;
          const levelB = levelOrder[b.level] || 99;
          if (levelA !== levelB) return levelA - levelB;
          return a.questionId.localeCompare(b.questionId);
        });

        studentQuestions.forEach((q) => {
          const questionId = q.questionId || "Unknown";
          const studentId = q.studentId || "Unknown";
          const groupId = q.groupId || "Unknown";
          const level = q.level || "Unknown";
          const question = q.question ? q.question.replace(/"/g, '""') : "";
          const options = Array.isArray(q.options)
            ? q.options.map((opt) => opt.replace(/"/g, '""')).join(" | ")
            : "";
          const correct = q.correct || "";

          csvContent += `"${questionId}","${studentId}","${groupId}","${level}","${question}","${options}","${correct}"\n`;
        });
      });

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", "All_Questions.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // CSV code here (unchanged)
  } catch (err) {
    console.error("❌ Error downloading questions:", err);
    alert("❌ Error downloading questions.");
  }
};


const handleDownloadIndividual = async (studentId, format) => {
  if (!studentId.trim()) {
    alert("⚠ Please enter a Student ID.");
    return;
  }

  setShowIndividualModal(false);

  try {
    const res = await fetch("http://localhost:5000/api/questions/all");
    const data = await res.json();

    if (!data.success || !data.questions || data.questions.length === 0) {
      alert("❌ No saved questions found.");
      return;
    }

    // Filter only this student's questions
    const studentQuestions = data.questions.filter(
      (q) => q.studentId === studentId
    );

    if (studentQuestions.length === 0) {
      alert(`❌ No questions found for Student ID: ${studentId}`);
      return;
    }

    // Sort by level + questionId
    const levelOrder = { Easy: 1, Intermediate: 2, Advanced: 3 };
    studentQuestions.sort((a, b) => {
      const levelA = levelOrder[a.level] || 99;
      const levelB = levelOrder[b.level] || 99;
      if (levelA !== levelB) return levelA - levelB;
      return a.questionId.localeCompare(b.questionId);
    });

    if (format === "pdf") {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = "/logoblack.png";

      logo.onload = () => {
        doc.addImage(logo, "PNG", 80, 10, 50, 15);
        let y = 30;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`Student: ${studentId}`, 10, y);
        y += 10;

        studentQuestions.forEach((q, idx) => {
          if (y > 270) { doc.addPage(); y = 10; }

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`${idx + 1}. (${q.questionId}) [${q.level} Level]`, 10, y);
          y += 6;

          const splitQuestion = doc.splitTextToSize(q.question || "", 180);
          doc.text(`Q: ${splitQuestion}`, 10, y);
          y += splitQuestion.length * 6;

          if (Array.isArray(q.options)) {
            q.options.forEach((opt, i) => {
              if (y > 270) { doc.addPage(); y = 10; }
              const letter = String.fromCharCode(65 + i);
              doc.text(`${letter}. ${opt}`, 15, y);
              y += 6;
            });
          }

          if (y > 270) { doc.addPage(); y = 10; }
          doc.setFont("helvetica", "bold");
          doc.text(`Correct Answer: ${q.correct || "N/A"}`, 10, y);
          y += 10;
          doc.setFont("helvetica", "normal");
        });

        doc.save(`Report_${studentId}.pdf`);
      };
    } else if (format === "csv") {
      let csvContent = "QuestionID,StudentID,GroupID,Level,Question,Options,Correct\n";

      studentQuestions.forEach((q) => {
        const questionId = q.questionId || "Unknown";
        const groupId = q.groupId || "Unknown";
        const level = q.level || "Unknown";
        const question = q.question ? q.question.replace(/"/g, '""') : "";
        const options = Array.isArray(q.options)
          ? q.options.map((opt) => opt.replace(/"/g, '""')).join(" | ")
          : "";
        const correct = q.correct || "";

        csvContent += `"${questionId}","${studentId}","${groupId}","${level}","${question}","${options}","${correct}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Report_${studentId}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error("❌ Error downloading individual report:", err);
    alert("❌ Error downloading individual report.");
  }
};




//headerrrr

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
        <h3>Question Generation Panel {instructorID ? `(Instructor ID: ${instructorID})` : ""}</h3>
        
        <div className="qg-header-right">
          <span className="clock" style={clockStyle}>{time.toLocaleTimeString()}</span>
          
          <div className="dropdown" ref={dropdownRef}>
            <button className="dropbtn" onClick={toggleMenu}>☰ Menu</button>
             {menuOpen && (
        <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShowDownloadModal(true)} className="btn-download">
            Download All Questions
          </button>
          <button onClick={() => setShowIndividualModal(true)} className="btn-individual">
            Download Individual Report
          </button>
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

{showDownloadModal && (
  <div
    className="format-modal-overlay"
    onClick={() => setShowDownloadModal(false)}
  >
    <div className="format-modal-box" onClick={(e) => e.stopPropagation()}>
      <h2>Select Download Format</h2>
      <p>Please choose your preferred format for downloading the questions.</p>
      <button className="csv-btn" onClick={() => handleDownloadAllQuestions("csv")}>
        CSV
      </button>
      <button className="pdf-btn" onClick={() => handleDownloadAllQuestions("pdf")}>
        PDF
      </button>
      <button className="close1-btn" onClick={() => setShowDownloadModal(false)}>Cancel</button>
    </div>
  </div>
)}


{showIndividualModal && (
  <div className="format-modal-overlay" onClick={() => setShowIndividualModal(false)}>
    <div className="format-modal-box" onClick={(e) => e.stopPropagation()}>
      <h2>Download Individual Report</h2>
      <p>Enter Student Index Number:</p>
      <input
        type="text"
        value={studentIndex}
        onChange={(e) => setStudentIndex(e.target.value)}
        placeholder="Enter Student ID"
        className="student-input"
      />
      <div style={{ marginTop: "15px" }}>
        <button
          className="pdf-btn"
          onClick={() => handleDownloadIndividual(studentIndex, "pdf")}
        >
          PDF
        </button>
        <button
          className="csv-btn"
          onClick={() => handleDownloadIndividual(studentIndex, "csv")}
        >
          CSV
        </button>
        <button className="close1-btn" onClick={() => setShowIndividualModal(false)}>
          Close
        </button>
      </div>
    </div>
  </div>
)}


      {/* Main content */}
      <div className="question-gen-container">
        {/* Student list */}
     {/* Student list */}
<div className="student-list">
  <h3>Student IDs</h3>

{/*  Search Panel */}
<div className="student-search-wrapper">
  <span className="search-icon">🔍︎</span>
  <input
    type="text"
    placeholder="Search Student ID..."
    className="student-search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

  {submissions.length > 0 ? (
    submissions
      .filter((sub) =>
        sub.studentID.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((sub) => (
        <div
          key={sub.studentID}
          className={`student-item 
            ${selectedStudent?.studentID === sub.studentID ? "active" : ""} 
            ${sub.questionGenerate ? "completed" : ""}`} // ✅ green if true
          onClick={() => handleSelectStudent(sub)}
        >
          {sub.studentID || "Unknown Student"}
        </div>
      ))
  ) : (
    <p className="placeholder">No submissions available yet.</p>
  )}


  
</div>



        {/* Submission details */}
        <div className="submission-details">
          {selectedStudent ? (
            <div>
              <p><strong>Group ID:</strong> {selectedStudent.groupID || "N/A"}</p>
              <p><strong>Language:</strong> {selectedStudent.languageType || "N/A"}</p>
              <p>
                <strong>Date Submitted:</strong>{" "}
                {selectedStudent.dateSubmit
                  ? new Date(selectedStudent.dateSubmit).toLocaleString()
                  : "N/A"}
              </p>
{/* Loading Overlay */}
{loadingQuestions && (
  <div className="loading-overlay">
    <div className="spinner"></div>
    <p>Generating questions, please wait...</p>
  </div>
)}

              {/* Code Summary */}
              <div className="summary-block">
                <h4>Summary</h4>
                {loadingSummary ? <p>Summarizing code...</p> : <p>{summary}</p>}
              </div>

           






              {showCodeModal && (
                <div className="modal-overlay" onClick={() => setShowCodeModal(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="modal-close-btn" onClick={() => setShowCodeModal(false)}>
                      &times;
                    </button>

                    <h4>{selectedStudent.studentID} - Code</h4>
                    <pre>{selectedStudent.code || "// No code available"}</pre>

                    <button
                      onClick={() => setShowCodeModal(false)}
                      className="btn-close-modal"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}





   {/* Generate Questions + View Code */}
{!selectedStudent?.questionGenerate && (
<div className="button-row">

    <button
      onClick={handleGenerateQuestions}
      className="btn-generate"
      disabled={loadingQuestions}
    >
      {loadingQuestions ? "Generating..." : "Generate Questions"}
    </button>

    <button
      onClick={() => setShowCodeModal(true)}
      className="btn-view-code"
    >
      View Code
    </button>
  </div>
)}


{selectedStudent?.questionGenerate ? (
  <div className="after-save">
  <p style={{ color: "green", fontWeight: "bold" }}>
    ✅ Questions were already generated for this student.
  </p>
  <div className="after-save-buttons">
    <button onClick={fetchSavedQuestions} className="btn-view-questions">
      View Saved Questions
    </button>
    <button onClick={() => setShowCodeModal(true)} className="btn-view-code">
      View Code
    </button>
  </div>
</div>

) : (
  (questionsByLevel.Easy.length > 0 ||
    questionsByLevel.Intermediate.length > 0 ||
    questionsByLevel.Advanced.length > 0) && (
    <button
      onClick={handleSaveQuestions}
      className="btn-save"
    >
      Save Questions
    </button>
  )
)}
{showSavedQuestionsModal && (
  <div className="modal-overlay" onClick={() => setShowSavedQuestionsModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close-btn" onClick={() => setShowSavedQuestionsModal(false)}>
        &times;
      </button>
      <h4>{selectedStudent.studentID} - Saved Questions</h4>

      {savedQuestions.length > 0 ? (
        ["Easy", "Intermediate", "Advanced"].map((level) => {
          const levelQuestions = savedQuestions.filter(
            (q) => q.questionId && q.questionId.startsWith(level)
          );
          if (levelQuestions.length === 0) return null;

          return (
            <div key={level} className="questions-level-section">
              <h5>{level} Level</h5>
              {levelQuestions.map((q, idx) => (
                <div key={q.questionId} className="saved-question-block">

                  
                  {editing.level === level && editing.idx === idx ? (
                    <div className="edit-form">
                      <input
                        type="text"
                        value={tempQuestion.question}
                        onChange={(e) =>
                          setTempQuestion((prev) => ({ ...prev, question: e.target.value }))
                        }
                        placeholder="Enter question"
                      />
                      {tempQuestion.options.map((opt, i) => (
                        <div key={i} className="option-field">
                          
                          
                          
                          <input
                            type="text"
                            value={tempQuestion.options[i]}
                            onChange={(e) => {
                              const newOptions = [...tempQuestion.options];
                              newOptions[i] = e.target.value;
                              setTempQuestion((prev) => ({ ...prev, options: newOptions }));
                            }}
                            placeholder={`Option ${["A","B","C","D","E"][i]}`}
                          />
                        <input
  type="radio"
  name={`correct-${level}-${idx}`}
  value={["A","B","C","D","E"][i]}    // ✅ assign value
  checked={tempQuestion.correct === ["A","B","C","D","E"][i]}
  onChange={(e) =>
    setTempQuestion((prev) => ({
      ...prev,
      correct: e.target.value,        // ✅ read from event
    }))
  }
/> 
{" "}
                          Correct
                        </div>
                      ))}
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`http://localhost:5000/api/questions/update-question/${q.questionId}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                question: tempQuestion.question,
                                options: tempQuestion.options,
                                correctAnswer: tempQuestion.correct
                              }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setSavedQuestions((prev) =>
                                prev.map((sq) =>
                                  sq.questionId === q.questionId ? { ...sq, ...tempQuestion } : sq
                                )
                              );
                              setEditing({ level: null, idx: null });
                              alert("✅ Question updated successfully!");
                            } else {
                              alert("❌ Failed to update question.");
                            }
                          } catch (err) {
                            console.error(err);
                            alert("❌ Failed to update question.");
                          }
                        }}
                        className="btn-save-question"
                      >
                        Save
                      </button>
                      <button className="btn-inline-cancel" onClick={() => setEditing({ level: null, idx: null })}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p>
                        <strong>
                          {idx + 1}. ({q.questionId}) {q.question}
                        </strong>
                      </p>
                      <ul>
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            style={{
                              fontWeight:
                                q.correct === ["A","B","C","D","E"][i] ? "bold" : "normal",
                                color:
      q.correct === ["A", "B", "C", "D", "E"][i]
        ? "red"
        : "black", 
                            }}
                          >
                            {["A","B","C","D","E"][i]}. {opt}
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>Correct Answer:</strong> {q.correct}
                      </p>
                      <div className="question-actions">
                        <button className="edit"
                          onClick={() => {
                            setEditing({ level, idx });
                            setTempQuestion({ question: q.question, options: [...q.options], correct: q.correct });
                          }}
                        >
                          Edit
                        </button>

                        <button className="delete"
                          onClick={async () => {
                            if (!window.confirm("Are you sure you want to delete this question?")) return;
                            try {
                              const res = await fetch(
                                `http://localhost:5000/api/questions/delete-question/${q.questionId}`,
                                { method: "DELETE" }
                              );
                              const data = await res.json();
                              if (data.success) {
                                setSavedQuestions(prev => prev.filter(sq => sq.questionId !== q.questionId));
                                alert("✅ Question deleted successfully!");
                              } else {
                                alert("❌ Failed to delete question.");
                              }
                            } catch (err) {
                              console.error(err);
                              alert("❌ Failed to delete question.");
                            }
                          }}
                        >
                          Delete
                        </button>

                       
                      </div>
                      <hr />
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })
      ) : (
        <p>No saved questions available.</p>
      )}
    </div>
  </div>
)}

              {/* Questions by Level */}
              {levels.map((level) => (
                <div key={level} className="questions-level">
                  <h3>{level} Level Questions</h3>
                  {questionsByLevel[level] && questionsByLevel[level].map((q, idx) => (
                 <div key={idx} className="question-block">
  {editing.level === level && editing.idx === idx ? (
    <div className="edit-form">
      {/* Edit form inputs */}
      <input
        type="text"
        value={tempQuestion.question}
        onChange={(e) =>
          setTempQuestion((prev) => ({ ...prev, question: e.target.value }))
        }
        placeholder="Enter question"
      />
      {tempQuestion.options.map((opt, i) => (
        <div key={i} className="option-field">
          <input
            type="text"
            value={tempQuestion.options[i]}
            onChange={(e) => {
              const newOptions = [...tempQuestion.options];
              newOptions[i] = e.target.value;
              setTempQuestion((prev) => ({ ...prev, options: newOptions }));
            }}
            placeholder={`Option ${["A", "B", "C", "D", "E"][i]}`}
          />
          <input
            type="radio"
            name={`correct-${level}-${idx}`}
            checked={tempQuestion.correct === ["A", "B", "C", "D", "E"][i]}
            onChange={() =>
              setTempQuestion((prev) => ({
                ...prev,
                correct: ["A", "B", "C", "D", "E"][i],
              }))
            }
          />{" "}
          Correct
        </div>
      ))}
      <button  className="btn-inline-save" onClick={saveEdit}>Save</button>
      <button className="btn-inline-cancel" onClick={cancelEdit}>Cancel</button>
    </div>
  ) : (
    <>
      <div className="question-content">
        <div>
          <p>
            <strong>
              {idx + 1}. {q.question}
            </strong>
          </p>
          <ul>
            {q.options.map((opt, i) => (
              <li
                key={i}
                style={{
                  fontWeight:
                    q.correct === ["A", "B", "C", "D", "E"][i]
                      ? "bold"
                      : "normal",

                  color:
      q.correct === ["A", "B", "C", "D", "E"][i]
        ? "red"
        : "black", 
                }}
              >
                {["A", "B", "C", "D", "E"][i]}. {opt}
              </li>
            ))}
          </ul>
        </div>
        <div className="question-actions">
          <button onClick={() => startEditing(level, idx)}>Edit</button>
          <button onClick={() => handleDeleteQuestion(level, idx)}>Delete</button>
          <button onClick={() => handleMoveQuestion(level, idx, -1)}>↑</button>
          <button onClick={() => handleMoveQuestion(level, idx, 1)}>↓</button>
          <button onClick={() => handleRegenerateQuestion(level, idx)}>Regenerate</button>
        </div>
      </div>
    </>
  )}
</div>

                  ))}
                </div>
              ))}

            </div>
          ) : (
        <div className="questiongenerateplaceholder">
  <h2 className="questiongenerateplaceholder-title">
    Welcome to the Question Generation Panel
  </h2>
  <p className="questiongenerateplaceholder-intro">
    Select a <strong>Student ID</strong> from the list to begin working with their submission.
  </p>

  <ul className="questiongenerateplaceholder-instructions">
    <li>
      <span className="questiongenerateplaceholder-color-box questiongenerateplaceholder-color-green"></span>
      <strong>Green IDs</strong> — Students who already have generated questions.
      You may review, edit, or update their questions.
    </li>
    <li>
      <span className="questiongenerateplaceholder-color-box questiongenerateplaceholder-color-white"></span>
      <strong>White IDs</strong> — Students without generated questions.
      You can create new questions from their submitted code.
    </li>
    <li>
      Once a student is selected, you will be able to:
      <ul>
        <li>View the submitted code</li>
        <li>Generate questions at Easy, Intermediate, and Advanced levels</li>
        <li>Edit generated questions to refine wording or options</li>
        <li>Generate a summary based on the student’s submitted code</li>
      </ul>
    </li>
  </ul>

  <p className="questiongenerateplaceholder-note">
    To get started, please click on a Student ID from the left panel.
  </p>
</div>


          )}
        </div>
      </div>

      {/* Footer */}
      <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
};

export default QuestionGeneration;
