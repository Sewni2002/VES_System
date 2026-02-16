import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ConductEvaluation.css";
import { io } from "socket.io-client";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");

function ConductEvaluation() {
const { sessionID } = useParams();
const [instructorID, setInstructorID] = useState(null);
const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
const [attemptStatus, setAttemptStatus] = useState({});

  const [evaluation, setEvaluation] = useState({ score: "", remarks: "" });
  const [time, setTime] = useState(new Date());
  const [showOverlay, setShowOverlay] = useState(true);
  const [currentGroup, setCurrentGroup] = useState(null);

  const [currentQIndex, setCurrentQIndex] = useState(0);
const [submittedStudents, setSubmittedStudents] = useState({});

  // Track student confirmations
  const [studentConfirmedList, setStudentConfirmedList] = useState({});
const [studentAnswers, setStudentAnswers] = useState({});


const [showStudentSubmittedOverlay, setShowStudentSubmittedOverlay] = useState(false);
const [submittedStudentID, setSubmittedStudentID] = useState("");

const [groupSearchTerm, setGroupSearchTerm] = useState("");


const [menuOpen, setMenuOpen] = useState(false);
const dropdownRef = useRef(null);

// Inside your component
const currentGroupRef = useRef(currentGroup);


  
    const [showSessionOverlay, setShowSessionOverlay] = useState(false);
    const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  

useEffect(() => {
  currentGroupRef.current = currentGroup;
}, [currentGroup]);





// Compute orderedQuestions first
const orderedQuestions = savedQuestions.map((q) => {
  let level = "Unknown";
  if (q.questionId.startsWith("Easy")) level = "Easy";
  else if (q.questionId.startsWith("Intermediate")) level = "Intermediate";
  else if (q.questionId.startsWith("Advanced")) level = "Advanced";
  return { ...q, level };
});







  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/getgroups/${instructorID}/${sessionID}`
      );
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error fetching groups:", err);
      return [];
    }
  };

  // Fetch students for a group
  const fetchStudents = async (groupid) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/group-students/${groupid}`
      );
      const data = await res.json();
      return { gid: data?.gid || groupid, students: data?.students || [] };
    } catch (err) {
      console.error(`Error fetching students for group ${groupid}:`, err);
      return { gid: groupid, students: [] };
    }
  };

  useEffect(() => {
    const loadGroupsAndStudents = async () => {
      if (!instructorID || !sessionID) return;
      const allocations = await fetchGroups();
      const groupsWithStudents = await Promise.all(
        allocations.map((alloc) => fetchStudents(alloc.groupId))
      );
      setGroups(groupsWithStudents);

      if (groupsWithStudents.length > 0) {
        setCurrentGroup(groupsWithStudents[0]);
      }
    };
    loadGroupsAndStudents();
  }, [instructorID, sessionID]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch saved questions for a student
const fetchSavedQuestions = async (student) => {
  if (!student) return [];
  setLoadingQuestions(true);
  try {
    const res = await fetch(
      `http://localhost:5000/api/questions/get-questions/${student.studentID}`
    );
    const data = await res.json();
    if (data.success) {
      setSavedQuestions(data.questions || []);
      setCurrentQIndex(0);
      return data.questions || [];
    } else {
      setSavedQuestions([]);
      alert("❌ No saved questions found.");
      return [];
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error fetching saved questions.");
    setSavedQuestions([]);
    return [];
  } finally {
    setLoadingQuestions(false);
  }
};

const handleSelectStudent = async (student , group) => {
  setSelectedStudent(student);
    setCurrentGroup(group);

  const questions = await fetchSavedQuestions(student);
  if (questions.length > 0) {
    const orderedQuestions = questions.map((q) => {
      let level = "Unknown";
      if (q.questionId.startsWith("Easy")) level = "Easy";
      else if (q.questionId.startsWith("Intermediate")) level = "Intermediate";
      else if (q.questionId.startsWith("Advanced")) level = "Advanced";
      return { ...q, level };
    });

    // Emit questions to student
   socket.emit("cacheStudentQuestions", {
      studentID: student.studentID,
      groupID: currentGroup.gid, 
      questions: orderedQuestions,
    });

    console.log(
      `📤 Sent questions for student ${student.studentID} in group ${currentGroup.gid}`
    );
  }
};




useEffect(() => {
  const fetchAttemptStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/automatedmark/attempt-status");
      const data = await res.json();
      if (data.success) {
        setAttemptStatus(data.attemptStatus);
      }
    } catch (err) {
      console.error("Error fetching attempt status:", err);
    }
  };

  fetchAttemptStatus();
}, []);



  const startGroupEvaluation = () => {
    if (!currentGroup || currentGroup.students.length === 0) {
      return alert("No students in this group");
    }
    const firstStudent = currentGroup.students[0];
    setSelectedStudent(firstStudent);
    fetchSavedQuestions(firstStudent);
    setShowOverlay(false);
    socket.emit("startEvaluation", {
      groupID: currentGroup.gid,
      studentID: firstStudent.studentID,
    });
  };



  useEffect(() => {
  socket.on("evaluationStarted", ({ groupID, studentID }) => {
    console.log("📩 Evaluation started:", { groupID, studentID });

    // Find the group
    const group = groups.find((g) => g.gid === groupID);
    if (group && group.students.length > 0) {
      setCurrentGroup(group);

      const student = group.students.find((s) => s.studentID === studentID);
      if (student) {
        setSelectedStudent(student);
        fetchSavedQuestions(student);
      }
    }

    setShowOverlay(false); // Hide overlay if it was still showing
  });

  return () => socket.off("evaluationStarted");
}, [groups]);


// after other socket listeners
useEffect(() => {
  socket.on("questionIndexChanged", ({ studentID, newIndex }) => {
    if (selectedStudent?.studentID === studentID) {
      console.log(`📩 Student ${studentID} moved to Q${newIndex + 1}`);
      setCurrentQIndex(newIndex);
    }
  });

  return () => socket.off("questionIndexChanged");
}, [selectedStudent]);




useEffect(() => {
  socket.on("studentAnswer", ({ studentID, questionId, answer }) => {
    console.log("📩 Answer received:", studentID, questionId, answer);

    setStudentAnswers((prev) => ({
      ...prev,
      [studentID]: {
        ...(prev[studentID] || {}),
        [questionId]: answer,
      },
    }));
  });

  return () => socket.off("studentAnswer");
}, []);


useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};



useEffect(() => {
  socket.on("finishAttempt", async ({ studentID }) => {
    console.log("📩 Student finished attempt:", studentID);

    const studentAnswerObj = studentAnswers[studentID];
    if (!studentAnswerObj) return;

    // Count correct answers by level
    let easyCount = 0;
    let interCount = 0;
    let advancedCount = 0;

    orderedQuestions.forEach((q) => {
      const ans = studentAnswerObj[q.questionId];
      if (ans && ans === q.correct) {
        if (q.level === "Easy") easyCount++;
        else if (q.level === "Intermediate") interCount++;
        else if (q.level === "Advanced") advancedCount++;
      }
    });

    const payload = {
      sid: studentID,
      easyCount,
      interCount,
      advancedCount,
      attempt: true,      // initially false
      remotereq: " ",
    };

    console.log("📤 Sending automated mark:", payload);

    try {
      // Save to your backend / DB
      await fetch("http://localhost:5000/api/automatedmark/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("✅ Automated mark saved for student:", studentID);

      setSubmittedStudentID(studentID);
      setShowStudentSubmittedOverlay(true);
    } catch (err) {
      console.error("❌ Error saving automated mark:", err);
    }
  });

  return () => socket.off("finishAttempt");
}, [studentAnswers, orderedQuestions]);



  // 🔹 Listen for student confirmation events
useEffect(() => {
  socket.on("studentConfirmed", ({ groupID, studentID }) => {
    console.log("📩 Student confirmed:", studentID);

    setStudentConfirmedList((prev) => ({
      ...prev,
      [studentID]: true,
    }));

    const student = currentGroup?.students.find((s) => s.studentID === studentID);
    if (student) {
      console.log("📤 Sending questions to student:", studentID);
  socket.emit("cacheStudentQuestions", {
  studentID: student.studentID,
  questions: orderedQuestions,
});

    }
  });

  return () => socket.off("studentConfirmed");
}, [currentGroup, orderedQuestions]);



//header

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
  


    const concludeSession = async () => {
  if (!sessionID) return alert("Session ID missing!");

  try {
    const res = await fetch(
      `http://localhost:5000/api/schedulerconviva/conclude-session/${sessionID}`,
      { method: "PUT" }
    );
    const data = await res.json();

    if (data.success) {
      alert(`✅ ${data.message}`);
      // ✅ Redirect after short delay (for alert to finish)
      setTimeout(() => {
        navigate("/instructorQuizView");
      }, 300);
    }
    else {
      alert(`⚠️ ${data.message}`);
    }
  } catch (err) {
    console.error("Error concluding session:", err);
    alert("❌ Error concluding session. Try again.");
  }
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
  

  const currentQuestion = orderedQuestions[currentQIndex];

  return (
    <div className="cel-page">
      {/* Header */}






  <div className="qg-header">
        <img src="/logoblack.png" alt="Logo" className="qg-logo" />
        <h3>Conduct Evaluation - Session: {sessionID}</h3>
        
        <div className="qg-header-right">
          <span className="clock" style={clockStyle}>{time.toLocaleTimeString()}</span>
          
          <div className="dropdown" ref={dropdownRef}>
            <button className="dropbtn" onClick={toggleMenu}>☰ Menu</button>
            {menuOpen && (
              <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowLogoutOverlay(true)}>Logout</button>
                <button onClick={concludeSession}>Conclude the Session</button>

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
      <div className="cel-content">
        {/* Left: Student list */}
        <div className="cel-left">
          {/* Group Search Panel */}
<div className="conduct-search-wrapper">
  <span className="conduct-icon">🔍︎</span>
  <input
    type="text"
    placeholder="Search Group ID..."
    className="conduct-search"
    value={groupSearchTerm}
    onChange={(e) => setGroupSearchTerm(e.target.value)}
  />
</div>

          {groups.length > 0 ? (
            groups.filter((group) =>
      group.gid.toLowerCase().includes(groupSearchTerm.toLowerCase())
    ).map((group, gIdx) => (
              <div key={gIdx} className="cel-group-box">
                <h3>Group: {group.gid}</h3>
                {group.students.length > 0 ? (
                  <ul>
              {group.students.map((student, idx) => {
  const isEvaluated = student.evaluated;
  const isRemote = student.remoteRequested;

  return (
    <li
      key={idx}
      className={`cel-student-item
        ${selectedStudent?.studentID === student.studentID ? "selected" : ""}
        ${isEvaluated ? "cel-disabled" : ""}
      `}
      onClick={() => {
        if (!isEvaluated) handleSelectStudent(student, group);
      }}
      style={{
        cursor: isEvaluated ? "not-allowed" : "pointer",
        opacity: isEvaluated ? 0.6 : 1,
      }}
      title={
        isRemote
          ? "🟡 Remote Viva Requested"
          : isEvaluated
          ? "✅ Already Evaluated"
          : "Click to evaluate"
      }
    >
      {student.studentID}

      {/* Status icons */}
      <span
        className={
          studentConfirmedList[student.studentID]
            ? "cel-status confirmed"
            : student.submitted
            ? "cel-status submitted"
            : "cel-status not-submitted"
        }
      >
        {studentConfirmedList[student.studentID]
          ? "🟢"
          : student.submitted
          ? "✔"
          : "✖"}
      </span>

      {/* Note for evaluated or remote viva */}
      {isEvaluated && (
        <span className="cel-note">
          {isRemote ? "🟡 Remote Viva Requested" : "✅ Evaluated"}
        </span>
      )}
    </li>
  );
})}

                  </ul>
                ) : (
                  <p>No students found.</p>
                )}
              </div>
            ))
          ) : (
            <p>No groups assigned.</p>
          )}
        </div>

        {/* Right: Questions + Evaluation */}
        <div className="cel-right">
          {selectedStudent ? (
            <div className="cel-eval-box">
             
             
            

            {selectedStudent && (
  <div className="student-answers">
    <h4>Selected Answers by {selectedStudent.studentID}</h4>
    {studentAnswers[selectedStudent.studentID] ? (
      <table className="answer-table">
        <thead>
          <tr>
            <th>QID</th>
            <th>Selected Answer</th>
            <th>Correct Answer</th>
          </tr>
        </thead>
        <tbody>
          {orderedQuestions.map((q) => (
            <tr key={q.questionId}>
              <td>{q.questionId}</td>
              <td>
                {studentAnswers[selectedStudent.studentID][q.questionId] ||
                  "❌ Not Answered"}
              </td>
              <td>{q.correct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No answers yet.</p>
    )}
  </div>
)}
             
             <h3>Questions for Student {selectedStudent.studentID}</h3>

              {loadingQuestions ? (
                <p>Loading questions...</p>
              ) : orderedQuestions.length > 0 ? (
                <div className="question-view">
                  <h4>
                    {currentQuestion.level} Level - Question {currentQIndex + 1} of{" "}
                    {orderedQuestions.length}
                  </h4>
                  <p>
                    <strong>
                      ({currentQuestion.questionId}) {currentQuestion.question}
                    </strong>
                  </p>
                  <ul>
                    {currentQuestion.options.map((opt, i) => (
                      <li
                        key={i}
                        style={{
                          fontWeight:
                            currentQuestion.correct === ["A", "B", "C", "D", "E"][i]
                              ? "bold"
                              : "normal",
                          color:
                            currentQuestion.correct === ["A", "B", "C", "D", "E"][i]
                              ? "red"
                              : "black",
                        }}
                      >
                        {["A", "B", "C", "D", "E"][i]}. {opt}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Correct Answer:</strong> {currentQuestion.correct}
                  </p>

                  <div className="nav-buttons">
                    <button
                      onClick={() => setCurrentQIndex((prev) => Math.max(prev - 1, 0))}
                      disabled={currentQIndex === 0}
                    >
                      ⬅ Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQIndex((prev) =>
                          Math.min(prev + 1, orderedQuestions.length - 1)
                        )
                      }
                      disabled={currentQIndex === orderedQuestions.length - 1}
                    >
                      Next ➡
                    </button>
                  </div>
                </div>
              ) : (
                <p>No saved questions for this student.</p>
              )}
            </div>
          ) : (
           <div className="conductevaluationplaceholder">
  <h2 className="conductevaluationplaceholder-title">
    Welcome to the Conduct Evaluation Panel
  </h2>
  <p className="conductevaluationplaceholder-intro">
    Select a <strong>Student ID</strong> from the left panel to start evaluating their answers.
  </p>

  <ul className="conductevaluationplaceholder-instructions">
    <li>
      <span className="conductevaluationplaceholder-color-box conductevaluationplaceholder-color-green"></span>
      <strong>Green IDs</strong> — Students who have already completed the automated evaluation. 
      <strong>✔ Tick</strong> indicates their answers have been submitted automatically.
    </li>
    <li>
      <span className="conductevaluationplaceholder-color-box conductevaluationplaceholder-color-red"></span>
      <strong>Red IDs</strong> — Students who have not yet submitted their answers. 
      <strong>✖ Cross</strong> indicates pending submission.
    </li>
    <li>
      <strong>🟢 Round Green</strong> — Students who have confirmed their participation.
    </li>
    <li>
      Once a student is selected, you will be able to:
      <ul>
        <li>View their submitted answers</li>
        <li>Check which questions were answered correctly</li>
        <li>Provide scores and remarks</li>
        <li>Move to the next student after submission</li>
        <li>Search for a student or group using the search option</li>
        <li>For MCQ tests, each student is given 1 minute to answer. 
          Answers will be auto-submitted after 1 minute, or they can submit earlier manually.
        </li>
      </ul>
    </li>
  </ul>

  <p className="conductevaluationplaceholder-note">
    To begin, click on a Student ID from the left panel and follow the instructions above.
  </p>
</div>

          )}


          

        </div>
      </div>

      {/* Overlay */}
  
{showOverlay && currentGroup && (
  <div className="cel-overlay">
    <div className="cel-overlay-box">
      <h3>Start Evaluation?</h3>
      <p>
        Start evaluation for Group <strong>{currentGroup.gid}</strong>?
      </p>
      <div className="overlay-buttons">
        <button onClick={startGroupEvaluation}>Yes, Start</button>
        <button onClick={() => setShowOverlay(false)}>Close</button>
      </div>
    </div>
  </div>
)}

      {/* Footer */}
      <div className="cel-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>


{/* Student Submitted Overlay */}
{showStudentSubmittedOverlay && (
  <div className="student-submitted-overlay">
    <div className="student-submitted-box">
      <h2>✅ Student Submitted</h2>
      <p>
        Student <strong>{submittedStudentID}</strong> has submitted their answers.
      </p>
      <p>Answers have been successfully stored. Proceed to the next student.</p>
      <button
  className="btn-ok-overlay"
  onClick={() => {
    setShowStudentSubmittedOverlay(false);

    // ✅ Mark attempt as done
    setAttemptStatus((prev) => ({
      ...prev,
      [submittedStudentID]: true,
    }));

    // ✅ Mark as submitted (for any UI logic)
    setSubmittedStudents((prev) => ({
      ...prev,
      [submittedStudentID]: true,
    }));

    // ✅ Update "evaluated" flag inside the correct group
    setGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        students: group.students.map((student) =>
          student.studentID === submittedStudentID
            ? { ...student, evaluated: true } // 🔹 mark as evaluated
            : student
        ),
      }))
    );
  }}
>
  OK
</button>


    </div>
  </div>
)}

    </div>
  );
}

export default ConductEvaluation;
