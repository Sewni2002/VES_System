import React, { useState } from "react";
import axios from "axios";
import "./AddDeanForm.css";

const AddDeanForm = ({ onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    deanID: "",
    name: "",
    email: "",
    password: "",
    faculty: "",
    contact: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/deanadminadding/add", formData);
      alert(res.data.message);
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add Dean");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{marginTop:"95px", width:"100%"}}>

    <form className="add-dean-form" onSubmit={handleSubmit} style={{margin:"50px"}}>
                          <h3 style={{textAlign:"center"}}>Add new Dean</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <input type="text" name="deanID" placeholder="Dean ID" onChange={handleChange} required />
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <input type="text" name="faculty" placeholder="Faculty" onChange={handleChange} />
      <input type="text" name="contact" placeholder="Contact" onChange={handleChange} />
      <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Dean"}</button>
      <button type="button" onClick={onClose}>Cancel</button>
    </form>
    </div>
  );
};

export default AddDeanForm;
