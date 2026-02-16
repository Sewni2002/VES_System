import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [student, setStudent] = useState({
    iname: "",
    fname: "",
    email: "",
    password: "",
    address: "",
    vivaregstatus: false,
    academic_status: "",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudent((prevStudent) => ({
      ...prevStudent,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/students/register", student);

      alert("✅ Registered successfully!");
      navigate("/studentdetails");
    } catch (error) {
      console.error("❌ Registration failed:", error);
      alert("Registration failed: " + error.response?.data?.error || error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📋 Student Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>Initial Name (iname):</label><br />
        <input
          type="text"
          name="iname"
          value={student.iname}
          onChange={handleInputChange}
          required
        /><br /><br />

<label>Full Name (fname):</label><br />
        <input
          type="text"
          name="fname"
          value={student.fname}
          onChange={handleInputChange}
          required
        /><br /><br />
        
        <label>Email:</label><br />
        <input
          type="email"
          name="email"
          value={student.email}
          onChange={handleInputChange}
          required
        /><br /><br />

        <label>Password:</label><br />
        <input
          type="password"
          name="password"
          value={student.password}
          onChange={handleInputChange}
          required
        /><br /><br />

        <label>Address:</label><br />
        <input
          type="text"
          name="address"
          value={student.address}
          onChange={handleInputChange}
          required
        /><br /><br />

        <label>
          VIVA Registration Status:
          <input
            type="checkbox"
            name="vivaregstatus"
            checked={student.vivaregstatus}
            onChange={handleInputChange}
          />
        </label><br /><br />

        <label>Academic Status:</label><br />
        <input
          type="text"
          name="academic_status"
          value={student.academic_status}
          onChange={handleInputChange}
          required
        /><br /><br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
