import React, { useState } from "react";
import axios from "axios";
import "./AddLICForm.css";


const AddLICForm = ({ onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    licID: "",
    name: "",
    email: "",
    password: "",
    department: "",
    contact: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/licadminadding/add", formData);
      alert(res.data.message);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add LIC");
    } finally {
      setLoading(false);
    }
  };

  return (
        <div style={{marginTop:"95px", width:"100%"}}>

    <form className="add-lic-form" onSubmit={handleSubmit} style={{margin:"50px"}}>
                                  <h3 style={{textAlign:"center"}}>Add new LIC</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="text" name="licID" placeholder="LIC ID" onChange={handleChange} required />
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="department" placeholder="Department" onChange={handleChange} />
      <input type="text" name="contact" placeholder="Contact" onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add LIC"}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
    </div>
  );
};

export default AddLICForm;
