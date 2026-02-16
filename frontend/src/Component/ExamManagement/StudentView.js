import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./StudentView.css";

const socket = io("http://localhost:5000");

function StudentView() {
  const [sessionID, setSessionID] = useState(null);
  const [groupID, setGroupID] = useState(null);
  const [studentID, setStudentID] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [evaluationStarted, setEvaluationStarted] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false); // <-- new state



const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
const [timerActive, setTimerActive] = useState(false);

  // Listen for cached questions
useEffect(() => {
socket.on("cacheStudentQuestions", ({ studentID: newID, groupID: newGroupID, questions }) => {
  setStudentID(newID);
  setGroupID(newGroupID);
    setQuestions(questions);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setShowSuccessOverlay(false);
    setQuestionsReady(true); // mark questions ready
    
    setEvaluationStarted(true);


    // Only reset confirmed if it's a new student/session
    setConfirmed((prev) => (prev && newID === studentID ? true : false));

    console.log("✅ Received questions for student:", newID, questions);
  });
  return () => socket.off("cacheStudentQuestions");
}, [studentID]);

  const currentQuestion = questions[currentQIndex];



  useEffect(() => {
  if (!studentID) return;

  // find the groupID from questions (or from payload cache)
  const currentQ = questions[0];
  if (currentQ && currentQ.groupID) {
    setGroupID(currentQ.groupID);
  }

}, [studentID, questions]);
  const handlePrev = () => {
    setCurrentQIndex((prev) => {
      const newIndex = Math.max(prev - 1, 0);
      socket.emit("questionIndexChanged", { studentID, newIndex });
      const prevQ = questions[newIndex];
      setSelectedOption(studentAnswers[prevQ.questionId] || null);
      return newIndex;
    });
  };

  const handleNext = () => {
    setCurrentQIndex((prev) => {
      const newIndex = Math.min(prev + 1, questions.length - 1);
      socket.emit("questionIndexChanged", { studentID, newIndex });
      const nextQ = questions[newIndex];
      setSelectedOption(studentAnswers[nextQ.questionId] || null);
      return newIndex;
    });
  };

  const handleOptionClick = (optionKey) => {
    setSelectedOption(optionKey);
    setStudentAnswers((prev) => ({
      ...prev,
      [currentQuestion.questionId]: optionKey,
    }));
    socket.emit("studentAnswer", {
      studentID,
      questionId: currentQuestion.questionId,
      answer: optionKey,
    });
  };





useEffect(() => {
  if (!timerActive) return;

  if (timeLeft <= 0) {
    // Time's up: auto-submit
    socket.emit("finishAttempt", { studentID });
    setShowConfirmOverlay(false);
    setShowSuccessOverlay(true);
    setTimerActive(false);
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, timerActive, studentID]);





  // Listen for session ID
  useEffect(() => {
    socket.on("receiveId", (id) => {
      setSessionID(id);
      setShowWelcome(false);
    });
    return () => socket.off("receiveId");
  }, []);

  // Listen for evaluation start
  useEffect(() => {
    socket.on("evaluationStarted", (data) => {
      console.log("📩 Received evaluationStarted:", data);
      setGroupID(data.groupID);
      setStudentID(data.studentID);
      //setEvaluationStarted(true);
      setShowWelcome(false);
    });
    return () => socket.off("evaluationStarted");
  }, []);

  // Ring & announce
  useEffect(() => {
    if (evaluationStarted && groupID && studentID) {
      const ringAndAnnounce = async () => {
        const ring = new Audio("/ring.mp3");
        await new Promise((resolve) => {
          ring.play();
          ring.onended = resolve;
        });

        for (let i = 0; i < 1; i++) {
          if ("speechSynthesis" in window) {
            const msg = `Calling student ${studentID} from group ${groupID}. Please join the session now.`;
            const utterance = new SpeechSynthesisUtterance(msg);
            utterance.rate = 1;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
            await new Promise((resolve) => {
              utterance.onend = resolve;
            });
          }
        }

        const secondRing = new Audio("/ring.mp3");
        await new Promise((resolve) => {
          secondRing.play();
          secondRing.onended = resolve;
        });
      };
      ringAndAnnounce();
    }
  }, [evaluationStarted, groupID, studentID]);

  return (
    <div className="student-container">
      {/* Video Background */}
      <video className="video-bg" autoPlay loop muted>
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="studentviewoverlay"></div>

      {/* Welcome Screen */}
      {showWelcome && !sessionID && !evaluationStarted && (
        <div className="welcome-box">
          <img src="/logo.png" alt="VES Logo" className="logo" />
          <h1 className="welcome-title">Welcome to VES System</h1>
          <h3 className="welcome-subtitle">Viva Evaluation System</h3>
          <p className="waiting-text" style={{ color: "white" }}>
            Waiting for your session to begin...
          </p>
          <div className="ss-footer">&copy; 2025 VES System. All rights reserved.</div>
        </div>
      )}

      {/* Session Ready */}
      {sessionID && !evaluationStarted && (
        <div className="session-ready-box">
          <img src="/logo.png" alt="VES Logo" className="logo-small" />
          <h1 className="session-ready-title">Session is Ready - {sessionID}</h1>
          <p className="session-id-text">
            Please wait till the instructor announces your Student ID
          </p>
          <div className="ss-footer">&copy; 2025 VES System. All rights reserved;</div>
        </div>
      )}

   {/* Evaluation Start & Confirm Participation */}
{questionsReady && !confirmed && groupID && studentID && (
  <div className="session-ready-box">
    <img src="/logo.png" alt="VES Logo" className="logo-small" />
    <h1 className="session-ready-title">
      Calling Student ID: <strong>{studentID}</strong>
    </h1>
    <p className="session-id-text">
      From Group: <strong>{groupID}</strong>
    </p>
    <p
      className="session-id-text"
      style={{ marginTop: "10px", fontStyle: "italic", color: "#00ffcc" }}
    >
      Please join the session now.
    </p>

    {/* 🔹 Instruction text */}
    <p
      className="session-id-text"
      style={{ marginTop: "10px", fontStyle: "italic", color: "yellow" }}
    >
      After confirming, the student will face the <strong>automated evaluation process</strong>.
      You will then get <strong>1 minute</strong> to submit answers for MCQ questions based on your code submission.
    </p>

    <button
      className="btn-confirm"
      style={{
        marginTop: "15px",
        padding: "10px 20px",
        backgroundColor: "green",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
      onClick={() => {
        setConfirmed(true);
        setTimeLeft(60); // reset to 60 seconds
        setTimerActive(true); // start countdown
        socket.emit("studentConfirmed", {
          groupID,
          studentID,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      ✅ Confirm Participation
    </button>

    <div className="ss-footer">&copy; 2025 VES System. All rights reserved;</div>
  </div>
)}

      {/* Questions View */}
      {confirmed && questionsReady && (
        <div className="question-view" style={{ position: "relative", zIndex: 3, backgroundColor: "white", padding: "20px", borderRadius: "10px", marginTop: "20px" }}>
         
         

   {timerActive && (
    <p style={{ fontWeight: "bold", color: "red" }}>
      Time Left: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
    </p>
  )}

         
         
         
          {questions.length > 0 ? (
            <>
              <h4>
                {currentQuestion.level} Level - Question {currentQIndex + 1} of {questions.length}
              </h4>
              <p style={{color:"black"}}>
                <strong>({currentQuestion.questionId}) {currentQuestion.question}</strong>
              </p>
              <ul>
                {currentQuestion.options.map((opt, i) => {
                  const optionKey = ["A","B","C","D","E"][i];
                  return (
                    <li
                      key={i}
                      onClick={() => handleOptionClick(optionKey)}
                      style={{
                        cursor: "pointer",
                        fontWeight: selectedOption === optionKey ? "bold" : "normal",
                        color: selectedOption === optionKey ? "blue" : "black",
                      }}
                    >
                      {optionKey}. {opt}
                    </li>
                  )
                })}
              </ul>

              <div className="nav-buttons">
                <button onClick={handlePrev} disabled={currentQIndex === 0}>⬅ Previous</button>
                {currentQIndex < questions.length - 1 ? (
                  <button onClick={handleNext}>Next ➡</button>
                ) : (
                  <button
                    onClick={() => setShowConfirmOverlay(true)}
                    style={{ backgroundColor: "green", color: "white" }}
                  >
                    Finish Attempt
                  </button>
                )}
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", marginTop: "50px" }}>Waiting for questions from instructor...</p>
          )}
        </div>
      )}

     {/* Confirm Submission Overlay */}
{showConfirmOverlay && (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <h3>Confirm Submission</h3>
      <p>Are you sure you want to submit your answers?</p>
      <button
        className="confirm-btn" 
        onClick={() => {
          socket.emit("finishAttempt", { studentID });
          setShowConfirmOverlay(false);
          setShowSuccessOverlay(true);
        }}
      >
        Yes, Submit
      </button>
      <button style={{ backgroundColor: "green", color: "white" }}
        className="cancel-btn"
        onClick={() => setShowConfirmOverlay(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)}

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div
          className="overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="overlay-box"
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              maxWidth: "600px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ color: "green", marginBottom: "20px" }}>✅ Submission Successful</h2>
            <p style={{color:"black"}}>Student <strong>{studentID}</strong>, you have successfully completed the <strong>automated examination</strong>.</p>
            <p style={{color:"black"}}>You are now formally eligible to proceed with the <strong>manual evaluation process</strong>.</p>
            <p style={{color:"black"}}>Please wait for further instructions from your instructor.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentView;
