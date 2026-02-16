import React, { useState } from "react";
import axios from "axios";
import "./UpdateDeanForm.css";

const UpdateDeanForm = ({ onClose, onUpdated }) => {
  const [deanIDInput, setDeanIDInput] = useState("");
  const [deanData, setDeanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // Search Dean by ID
  const handleSearch = async () => {
    if (!deanIDInput) return;
    setError("");
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/deanadminadding/${deanIDInput}`);
      setDeanData(res.data);
      setEditing(false); // initially read-only
    } catch (err) {
      setError(err.response?.data?.message || "Dean not found");
      setDeanData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => setDeanData({ ...deanData, [e.target.name]: e.target.value });

  // Update Dean
  const handleUpdate = async () => {
    if (!deanData) return;
    setError("");
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/deanadminadding/${deanData.deanID}`, deanData);
      alert("Dean updated successfully");
      onUpdated();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update Dean");
    } finally {
      setLoading(false);
    }
  };

  // Delete Dean
  const handleDelete = async () => {
    if (!deanData) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this Dean?");
    if (!confirmDelete) return;

    setError("");
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/deanadminadding/delete/${deanData.deanID}`);
      alert("Dean deleted successfully");
      onUpdated();
      setDeanData(null);
      setDeanIDInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete Dean");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-dean-form">
      {!deanData ? (
<div >
          <h3>Enter Dean ID to search</h3>
          <input
            type="text"
            placeholder="Dean ID"
            value={deanIDInput}
            onChange={(e) => setDeanIDInput(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>Dean Details</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="deanID" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Dean ID:</label>
    <input
      type="text"
      id="deanID"
      name="deanID"
      value={deanData.deanID}
      readOnly
      placeholder="Enter Dean ID"
      style={{ flex: 1 }}
    />
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="name" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Name:</label>
    <input
      type="text"
      id="name"
      name="name"
      value={deanData.name}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Name"
      style={{ flex: 1 }}
    />
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="email" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Email:</label>
    <input
      type="email"
      id="email"
      name="email"
      value={deanData.email}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Email"
      style={{ flex: 1 }}
    />
  </div>

  

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="faculty" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Faculty:</label>
    <input
      type="text"
      id="faculty"
      name="faculty"
      value={deanData.faculty || ""}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Faculty"
      style={{ flex: 1 }}
    />
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="contact" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Contact:</label>
    <input
      type="text"
      id="contact"
      name="contact"
      value={deanData.contact || ""}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Contact"
      style={{ flex: 1 }}
    />
  </div>

  
          </div>

          {/* Buttons */}
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            {!editing ? (
              <>
                <button onClick={() => setEditing(true)}>Edit</button>
                <button onClick={handleDelete} disabled={loading}>
                  {loading ? "Deleting..." : "Delete"}
                </button>
                
              </>
            ) : (
              <>
                <button onClick={handleUpdate} disabled={loading}>
                  {loading ? "Updating..." : "Update"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    handleSearch(); // reset fields
                  }}
                >
                  Cancel
                </button>
              </>
            )}

            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateDeanForm;
