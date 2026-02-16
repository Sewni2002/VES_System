import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./StudentView.css";



const socket = io("http://localhost:5000");

function Check() {
  const [studentID, setStudentID] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
const [studentAnswers, setStudentAnswers] = useState({});
const [showConfirmOverlay, setShowConfirmOverlay] = useState(false);
const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);






const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    socket.on("cacheStudentQuestions", ({ studentID, questions }) => {
      setStudentID(studentID);
      setQuestions(questions);
      setCurrentQIndex(0); // reset to first question
      setSelectedOption(null); // reset selection

    setShowSuccessOverlay(false); // ✅ hide success overlay when new questions arrive

    // 🔹 Start timer
    setTimeLeft(60); // reset to 60 seconds
    setTimerActive(true);
      console.log("✅ Received questions for student:", studentID, questions);
    });

    return () => socket.off("cacheStudentQuestions");
  }, []);

  const currentQuestion = questions[currentQIndex];


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




  // inside Check.js

const handlePrev = () => {
  setCurrentQIndex((prev) => {
    const newIndex = Math.max(prev - 1, 0);
    socket.emit("questionIndexChanged", { studentID, newIndex });
   
   
    const prevQ = questions[newIndex];
    setSelectedOption(studentAnswers[prevQ.questionId] || null);
   
    return newIndex;
  });
  setSelectedOption(null);
};

const handleNext = () => {
  setCurrentQIndex((prev) => {
    const newIndex = Math.min(prev + 1, questions.length - 1);
    socket.emit("questionIndexChanged", { studentID, newIndex });
    
    
    const nextQ = questions[newIndex];
    setSelectedOption(studentAnswers[nextQ.questionId] || null);
    return newIndex;
  });
  setSelectedOption(null);
};


const handleOptionClick = (optionKey) => {
  setSelectedOption(optionKey);
  console.log(`Student selected: ${optionKey}`);


  setStudentAnswers((prev) => ({
    ...prev,
    [currentQuestion.questionId]: optionKey,
  }));
  // 🔹 Emit to backend so instructor can see
  socket.emit("studentAnswer", {
    studentID,
    questionId: currentQuestion.questionId,
    answer: optionKey,
  });
};


  return (
    <div className="check-page" style={{backgroundcolor:"white"}}>
      <h2>Questions for Student: {studentID}</h2>

      {!showSuccessOverlay &&  questions.length > 0 ? (
        <div className="question-view"      style={{ backgroundColor: "white", color: "black" }}
>


   {timerActive && (
    <p style={{ fontWeight: "bold", color: "red" }}>
      Time Left: {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
    </p>
  )}

  
          <h4>
            {currentQuestion.level} Level - Question {currentQIndex + 1} of{" "}
            {questions.length}
          </h4>
          <p>
            <strong>
              ({currentQuestion.questionId}) {currentQuestion.question}
            </strong>
          </p>
          <ul>
            {currentQuestion.options.map((opt, i) => {
              const optionKey = ["A", "B", "C", "D", "E"][i];
              return (
                <li
                  key={i}
                  onClick={() => handleOptionClick(optionKey)}
                  style={{
                    cursor: "pointer",
                    fontWeight:
                      selectedOption === optionKey ? "bold" : "normal",
                    color: selectedOption === optionKey ? "blue" : "black",
                  }}
                >
                  {optionKey}. {opt}
                </li>
              );
            })}
          </ul>

          {/* Navigation Buttons */}
 <div className="nav-buttons">
  <button onClick={handlePrev} disabled={currentQIndex === 0}>
    ⬅ Previous
  </button>

  {currentQIndex < questions.length - 1 ? (
    <button onClick={handleNext}>
      Next ➡
    </button>
  ) : (
    <button
  onClick={() => setShowConfirmOverlay(true)}
  style={{ backgroundColor: "green", color: "white" }}
>
  Finish Attempt
</button>

  )}
</div>


        </div>
      ) : (
        <p>No questions received yet.</p>
      )}




      {showConfirmOverlay && (
  <div className="overlay">
    <div className="overlay-box">
      <h3>Confirm Submission</h3>
      <p>Are you sure you want to submit your answers?</p>
      <button
        onClick={() => {
          // Emit finish attempt
          socket.emit("finishAttempt", { studentID });
          // Hide confirmation overlay
          setShowConfirmOverlay(false);
          // Show success overlay
          setShowSuccessOverlay(true);
        }}
      >
        Yes, Submit
      </button>
      <button onClick={() => setShowConfirmOverlay(false)}>Cancel</button>
    </div>
  </div>
)}


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
      <h2 style={{ color: "green", marginBottom: "20px" }}>
        ✅ Submission Successful
      </h2>
      <p style={{ fontSize: "16px", marginBottom: "10px" }}>
        Student <strong>{studentID}</strong>, you have successfully completed the{" "}
        <strong>automated examination</strong>.
      </p>
      <p style={{ fontSize: "16px", marginBottom: "10px" }}>
        You are now formally eligible to proceed with the{" "}
        <strong>manual evaluation process</strong>.
      </p>
      <p style={{ fontSize: "16px", marginTop: "20px" }}>
        Please wait for further instructions from your instructor.
      </p>
    </div>
  </div>
)}


    </div>






  );
}

export default Check;
