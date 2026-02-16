import React, { useState, useEffect } from "react";
import axios from "axios";
import "./StudentLogin.css";

function StudentLogin() {
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [latestMessage, setLatestMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/latest-message")
      .then((res) => setLatestMessage(res.data.message))
      .catch((err) => console.error("Error fetching message:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/student-login", {
        studentID,
        password,
      });
      alert("Login Successful!");
      // Redirect or store token if needed
    } catch (err) {
      setError("Invalid Student ID or Password");
    }
  };

  return (
    <div className="login-container">
      <h2>Student Login</h2>
      {latestMessage && (
        <div className="latest-message">
          <strong>Notice:</strong> <span>{latestMessage}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentID}
          onChange={(e) => setStudentID(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default StudentLogin;
