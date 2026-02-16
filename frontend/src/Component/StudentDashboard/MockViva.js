import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StuDashboard.css";

function MockViva() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!studentID) { navigate("/login"); return; }
    axios.get(`http://localhost:5000/api/SPmockviva/${studentID}`)
      .then(res => { setQuestions(res.data.questions); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [studentID, navigate]);

  const handleChange = (qid, index) => {
    setAnswers(prev => ({ ...prev, [qid.toString()]: index }));
  };

  const handleSubmit = () => {
    const payload = { 
      studentID, 
      answers: questions.map(q => ({
        questionID: q._id,
        selectedOption: answers[q._id.toString()] ?? null
      }))
    };

    axios.post("http://localhost:5000/api/SPmockviva/submit", payload)
      .then(res => { setResult(res.data); })
      .catch(err => { 
        console.error(err); 
        alert(err.response?.data?.error || "Submission failed"); 
      });
  };

  if (loading) return <div className="SP_mv_loading">Loading questions...</div>;

  return (
    <div className="SP_mv_container">
      <div className="SP_mv_content_box">
        <h1 className="SP_mv_title">Mock Viva Practise Test</h1>
        {questions.map((q, idx) => (
          <div key={q._id} className="SP_mv_question_card">
            <p className="SP_mv_question_text">
              <span className="SP_mv_question_number">Q{idx + 1}:</span> {q.question}
            </p>
            <div className="SP_mv_options_container">
              {q.options.map((opt, i) => (
                <label key={i} className="SP_mv_option_label">
                  <input
                    type="radio"
                    className="SP_mv_radio_input"
                    name={q._id.toString()}
                    checked={answers[q._id.toString()] === i}
                    onChange={() => handleChange(q._id, i)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="SP_mv_submit_button" onClick={handleSubmit}>Submit</button>

        {result && (
          <div className="SP_mv_result_container">
            <h2 className="SP_mv_result_title">Your Result</h2>
            <p className="SP_mv_score_display">Score: {result.score} / {questions.length}</p>
            <p className="SP_mv_feedback_text">Feedback: {result.feedback}</p>
            <p className="SP_mv_feedback_text">Attempt Number: {result.attemptNumber} / 3</p>
          </div>
        )}
      </div>

      {/* Right side question number panel */}
      <div className="SP_mv_question_panel">
        <h3 className="SP_mv_question_panel_title">Questions</h3>
        {questions.map((q, idx) => (
          <div
            key={q._id}
            className={`SP_mv_question_number_box ${answers[q._id.toString()] !== undefined ? "marked" : ""}`}
            onClick={() => document.getElementsByName(q._id.toString())[0]?.scrollIntoView({ behavior: "smooth" })}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MockViva;
