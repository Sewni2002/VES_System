import React, { useState } from "react";
import axios from "axios";
import "./UpdateLICForm.css";

const UpdateLICForm = ({ onClose, onUpdated }) => {
  const [licIDInput, setLicIDInput] = useState("");
  const [licData, setLicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false); // Tracks if fields are editable

  // Search LIC by ID
  const handleSearch = async () => {
    if (!licIDInput) return;
    setError("");
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/licadminadding/${licIDInput}`);
      setLicData(res.data);
      setEditing(false); // initially read-only
    } catch (err) {
      setError(err.response?.data?.message || "LIC not found");
      setLicData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => setLicData({ ...licData, [e.target.name]: e.target.value });

  // Update LIC
  const handleUpdate = async () => {
    if (!licData) return;
    setError("");
    try {
      setLoading(true);
      await axios.put(`http://localhost:5000/api/licadminadding/${licData.licID}`, licData);
      alert("LIC updated successfully");
      onUpdated();
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update LIC");
    } finally {
      setLoading(false);
    }
  };

  // Delete LIC
  const handleDelete = async () => {
    if (!licData) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this LIC?");
    if (!confirmDelete) return;

    setError("");
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/licadminadding/delete/${licData.licID}`);
      alert("LIC deleted successfully");
      onUpdated();
      setLicData(null);
      setLicIDInput("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete LIC");
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="update-lic-form">     
     {!licData ? (
        <div>
          <h3>Enter LIC ID to search</h3>
          <input
            type="text"
            placeholder="LIC ID"
            value={licIDInput}
            onChange={(e) => setLicIDInput(e.target.value)}
          />

          
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button onClick={onClose}>Cancel</button>
        </div>
      ) : (
        <div>
          <h3>LIC Details</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="licID" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>LIC ID:</label>
    <input
      type="text"
      id="licID"
      name="licID"
      value={licData.licID}
      readOnly
      placeholder="Enter LIC ID"
      style={{ flex: 1 }}
    />
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="name" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Name:</label>
    <input
      type="text"
      id="name"
      name="name"
      value={licData.name}
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
      value={licData.email}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Email"
      style={{ flex: 1 }}
    />
  </div>



  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="department" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Department:</label>
    <input
      type="text"
      id="department"
      name="department"
      value={licData.department || ""}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Department"
      style={{ flex: 1 }}
    />
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
    <label htmlFor="contact" style={{ width: "90px", textAlign: "left", fontWeight: "600" }}>Contact:</label>
    <input
      type="text"
      id="contact"
      name="contact"
      value={licData.contact || ""}
      onChange={handleChange}
      readOnly={!editing}
      placeholder="Enter Contact"
      style={{ flex: 1 }}
    />
  </div>
</div>

          </div>

          {/* Buttons */}
          <div style={{ marginTop: "0.1px", display: "flex", gap: "10px" }}>
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
                    handleSearch(); // Reset fields to original values
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

export default UpdateLICForm;
