// GroupChat.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./GroupChat.css";

function GroupChat() {
  const navigate = useNavigate();
  const studentID = localStorage.getItem("studentID");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [file, setFile] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student info
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/SPstudentRoute/student/${studentID}`
        );
        setStudent(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch student data");
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentID]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/SPchat/${studentID}`
        );
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [studentID]);

  const handleSend = async () => {
    if (!newMsg && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await sendMessage(reader.result, file.name);
      };
      reader.readAsDataURL(file);
    } else {
      await sendMessage("", "");
    }

    setNewMsg("");
    setFile(null);
  };

  const sendMessage = async (fileData, fileName) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/SPchat/${studentID}`,
        {
          message: newMsg,
          file: fileData,
          fileName: fileName,
        }
      );
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/SPchat/delete/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  const goToDashboard = () => navigate("/studentdashboard");
  const goToProfile = () => navigate("/profile");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
      <div className="SP_dashboard_main chat_main">
        <button className="SP_chat_back_btn" onClick={goToDashboard}>
          ← Back
        </button>
        <h2>Team Chat</h2>
        <div className="SP_chat_window">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`SP_chat_message ${
                msg.senderID === studentID ? "SP_chat_right" : "SP_chat_left"
              }`}
            >
              <div>
                <strong>{msg.senderName}:</strong> {msg.message}
                {msg.file && (
                    <div>
                      <a
                        href={msg.file}
                        download={msg.fileName || "file"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="SP_chat_file_btn"
                      >
                        📎 {msg.fileName || "Download File"}
                      </a>
                    </div>
                  )}

              </div>
              <div className="SP_chat_footer">
                <span className="SP_chat_time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
                {msg.senderID === studentID && (
                  <button
                    className="SP_delete_btn"
                    onClick={() => handleDelete(msg._id)}
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="SP_chat_input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
          />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
          <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
  );
}

export default GroupChat;
