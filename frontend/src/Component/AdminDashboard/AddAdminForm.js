import React, { useState } from "react";
import axios from "axios";
import "./AddAdminForm.css";


const AddAdminForm = ({ onClose, onAdminAdded }) => {
  const [formData, setFormData] = useState({
    adminID: "",
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
  e.preventDefault();
  setError("");

  // Phone validation
  if (!/^\d{10}$/.test(formData.phone)) {
    setError("Phone number must be exactly 10 digits");
    return;
  }

  // Password validation
  const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
  if (!passwordPattern.test(formData.password)) {
    setError("Password must contain uppercase, lowercase, number, special character, and min 8 chars");
    return;
  }

  setLoading(true);
  try {
    const res = await axios.post("http://localhost:5000/api/adminadding/add-admin", formData);
    alert(res.data.message);
    onAdminAdded();
    onClose();
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Failed to add admin");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="add-admin-form">
      <h2>Add Admin</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
   <form onSubmit={handleSubmit}>
  <input 
    type="text" 
    name="adminID" 
    placeholder="Admin ID" 
    onChange={handleChange} 
    required 
  />

  <input 
    type="text" 
    name="firstname" 
    placeholder="First Name" 
    onChange={handleChange} 
    required 
  />

  <input 
    type="text" 
    name="lastname" 
    placeholder="Last Name" 
    onChange={handleChange} 
    required 
  />

  <input 
    type="email" 
    name="email" 
    placeholder="Email" 
    onChange={handleChange} 
    required 
  />

  <input 
    type="text" 
    name="phone" 
    placeholder="Phone (10 digits)" 
    onChange={handleChange} 
    required 
    pattern="\d{10}" 
    title="Phone number must be exactly 10 digits"
  />

  <input 
    type="password" 
    name="password" 
    placeholder="Password" 
    onChange={handleChange} 
    required 
    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}" 
    title="Password must contain uppercase, lowercase, number, special character, min 8 chars"
  />

  <button type="submit" disabled={loading}>
    {loading ? "Adding..." : "Add Admin"}
  </button>
  <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
    Cancel
  </button>
</form>

    </div>
  );
};

export default AddAdminForm;
