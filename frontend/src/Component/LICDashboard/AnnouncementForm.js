import React, { useState } from "react";

function AnnouncementForm({ onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      const data = await res.json();
      setSuccess(`Announcement "${data.title}" created successfully!`);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="overlay">
      <div className="overlayContent" style={{ maxWidth: 500, padding: 20 }}>
        <h3>Create Announcement</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Title</label>
            <input
              type="text"
              value={title}
              
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "95%", padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "95%", padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
  type="submit"
  style={{
    padding: "10px 18px",
    borderRadius: "6px",
    backgroundColor: "#0c4a6e", // formal dark blue
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#0369a1")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#0c4a6e")}
>
  Save
</button>

<button
  type="button"
  onClick={onClose}
  style={{
    padding: "10px 18px",
    borderRadius: "6px",
    backgroundColor: "#374151", // formal dark gray
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    marginLeft: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  }}
  onMouseOver={(e) => (e.target.style.backgroundColor = "#4b5563")}
  onMouseOut={(e) => (e.target.style.backgroundColor = "#374151")}
>
  Cancel
</button>

          </div>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementForm;
