//Isiwara

import React, { useState } from "react";
import axios from "axios";   // HTTP client for API call
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //controllers -> AluthController 
      const res = await axios.post("http://localhost:5000/api/login", {
        studentID,
        password,
      });

     // alert(res.data.message);

      if (res.data.role === "student") {
        localStorage.setItem("studentID", res.data.studentID);
        navigate(res.data.status ? "/studentdashboard" : "/vivaregister");
      } else if (res.data.role === "instructor") {
        localStorage.setItem("instructorID", res.data.instructorID);
        navigate("/quizeDashboard");
      } else if (res.data.role === "lic") {
        localStorage.setItem("licID", res.data.licID);
        navigate("/licdashboard");
      } else if (res.data.role === "dean") {
        localStorage.setItem("deanID", res.data.deanID);
        navigate("/deandashboard");
      }else if (res.data.role === "admin") {
        localStorage.setItem("adminID", res.data.adminID);
        localStorage.setItem("adminName",res.data.name);
        navigate("/admindashboardVES");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Login failed";
      alert(
        errorMsg === "User not found"
          ? "User not found. Please check your ID and try again."
          : errorMsg
      );
    }
  };
return (
<div className={styles.loginContainer}>
  <div
  className={styles.rightPanel}
  style={{ backgroundImage: `url("/backgroundsignin.jpg")` }}
><div className={styles.rightPanelContent}>
  <div className={styles.logoContainer}>
    <img
      src="/logo.png"
      alt="VES Logo"
      className={styles.logo}
    />
  </div>
  <h1>
    Welcome <br />to VES Evaluations
  </h1>
  <p>
    Securely access your academic journey, manage your responsibilities,
    and stay connected with your institution — all in one powerful platform.
  </p>
</div>

</div>




  <div className={styles.loginBox}>
    <h2 className={styles.loginTitle}>Login</h2>
    <form onSubmit={handleSubmit} className={styles.loginForm}>
      <label className={styles.loginLabel}>User ID</label>
      <input
        type="text"
        className={styles.loginInput}
        value={studentID}
        onChange={(e) => setStudentID(e.target.value)}
        required
      />

      <label className={styles.loginLabel}>Password</label>
      <input
        type="password"
        className={styles.loginInput}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className={styles.forgotContainer}>
        <a href="/forgot-password" className={styles.forgotLink}>
          Forgot password?
        </a>
      </div>

      <button type="submit" className={styles.loginButton}>
        Login
      </button>


    </form>
    <p className={styles.loginNote}>
  *Students: Please log in using your initial Student Portal password with your Student ID. You may change it later after logging in.
</p>


   <div className={styles.registerContainer}>
  <a href="/instructor-register" className={styles.registerLink}>
    Instructor Registration
  </a>
</div>


  </div>
</div>


);


}

export default Login;
