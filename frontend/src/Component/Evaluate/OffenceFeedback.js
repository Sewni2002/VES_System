
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./OffenceFeedback.css";


function OffenceFeedback({ prefilledStudentId }) {
  const [studentId, setStudentId] = useState(prefilledStudentId || "");
  const [reason, setReason] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [editStudentId, setEditStudentId] = useState(null); // store studentId for edit

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    fetchFeedback();
  }, []);

  // --- Fetch feedback from server ---
  const fetchFeedback = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/offence-feedback");
      setFeedbackList(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      alert("Failed to fetch feedback");
    }
  };

  // --- Start recording ---
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return alert("Your browser does not support audio recording");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioFile(new File([blob], `recorded_${Date.now()}.webm`, { type: "audio/webm" }));
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Failed to start recording");
    }
  };

  // --- Stop recording ---
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // --- Submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // For new feedback, audioFile is required. For edit, optional
    if (!studentId || !reason || (!audioFile && !editStudentId)) {
      return alert(
        "Student ID, Reason, and Recorded Audio are required for new feedback"
      );
    }

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("reason", reason);
    if (audioFile) formData.append("audio", audioFile);

    try {
      if (editStudentId) {
        await axios.put(
          `http://localhost:5000/api/offence-feedback/by-student/${editStudentId}`,
          formData
        );
        setEditStudentId(null);
      } else {
        await axios.post("http://localhost:5000/api/offence-feedback", formData);
      }

      setReason("");
      setAudioFile(null);
      if (!prefilledStudentId) setStudentId("");
      fetchFeedback();
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback");
    }
  };

  // --- Edit feedback ---
  const handleEdit = (item) => {
    setEditStudentId(item.studentId); // store studentId
    setStudentId(item.studentId);
    setReason(item.reason);
    setAudioFile(null); // optional re-record
  };

  // --- Delete feedback ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/offence-feedback/${id}`);
      fetchFeedback();
    } catch (err) {
      console.error(err);
      alert("Failed to delete feedback");
    }
  };

  return (
    <div className="offence-feedback-section">
      <h2>Exam Offence Feedback</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          disabled={!!prefilledStudentId}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          style={{ marginRight: "0.5rem" }}
        />

        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          style={{ marginRight: "0.5rem" }}
        >
          {recording ? "Stop Recording" : "Record Audio"}
        </button>

        <button type="submit">{editStudentId ? "Update Feedback" : "Add Feedback"}</button>
      </form>

      {audioFile && (
        <p>
          Recorded Audio: {audioFile.name} <br />
          <audio controls src={URL.createObjectURL(audioFile)} />
        </p>
      )}

      <h3>Submitted Feedback</h3>
      <ul>
        {feedbackList.map((item) => (
          <li key={item._id} style={{ marginBottom: "0.5rem" }}>
            <strong>{item.studentId}:</strong> {item.reason} <br />
            {item.audioPath && (
              <audio
                controls
                src={`http://localhost:5000/${item.audioPath}`}
              />
            )}
            <br />
            <button
              onClick={() => handleEdit(item)}
              style={{ marginRight: "0.5rem" }}
            >
              Edit
            </button>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OffenceFeedback;
