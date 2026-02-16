//Isiwara

import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./InstructorRegister.module.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function InstructorRegister() {
  const [formData, setFormData] = useState({
    instructorID: "",
    name: "",
    email: "",
    department: "",
    contact: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationStatus, setValidationStatus] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState(Array(6).fill(""));
  const [resendCountdown, setResendCountdown] = useState(60);
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successStep, setSuccessStep] = useState("Initializing...");

  const navigate = useNavigate();

  const isPasswordValid =
    validationStatus.length &&
    validationStatus.uppercase &&
    validationStatus.lowercase &&
    validationStatus.number &&
    validationStatus.match;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

useEffect(() => {
  if (showSuccessOverlay) {
    const steps = [
      "Initializing modules...",
      "Connecting to system core...",
      "Generating dashboard UI...",
      "Optimizing settings...",
      "Finalizing...",
      "Redirecting to homepage..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setSuccessStep(steps[i]);
      i++;
      if (i === steps.length) {
        clearInterval(interval);
        setTimeout(() => navigate("/"), 1000);
      }
    }, 1500);
  }
}, [showSuccessOverlay, navigate]);

  useEffect(() => {
    const length = formData.password.length >= 8;
    const uppercase = /[A-Z]/.test(formData.password);
    const lowercase = /[a-z]/.test(formData.password);
    const number = /\d/.test(formData.password);
    const match = formData.password && confirmPassword && formData.password === confirmPassword;
    setValidationStatus({ length, uppercase, lowercase, number, match });
  }, [formData.password, confirmPassword]);

  useEffect(() => {
    let timer;
    if (showOTPModal && resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown, showOTPModal]);

  const handleSendOTP = async () => {
    if (!formData.contact.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/otp/send-otp", { phone: formData.contact });
      setShowOTPModal(true);
setOtpInput(Array(6).fill("")); // ✅ resets to ["", "", "", "", "", ""]
      setResendCountdown(60);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

 const handleVerifyOTP = async () => {
  try {
    const otpString = otpInput.join("");
    console.log("Verifying OTP:", otpString, "for phone:", formData.contact);

    await axios.post("http://localhost:5000/api/otp/verify-otp", {
      phone: formData.contact,
      otp: otpString,
    });

    setPhoneVerified(true);
    setShowOTPModal(false);
  } catch (err) {
    setOtpErrorMessage("❌ Invalid OTP. Please try again.");
    setTimeout(() => setOtpErrorMessage(""), 3000);
  }
};

  const handleResendOTP = async () => {
    await handleSendOTP();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      alert("Please enter a strong password that meets all criteria.");
      return;
    }

    if (!phoneVerified) {
      alert("Please verify your phone number before submitting.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/instructors/create", formData, {
        headers: { "Content-Type": "application/json" },
      });
     setShowSuccessOverlay(true); // ✅ Show the overlay
   setShowSuccessOverlay(true);
   console.log("Instructor created:", res.data);


    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
<div className={styles.instructorRegisterPage}>
  <div className={styles.registerContainer} style={{ maxWidth: "900px", margin: "auto" }}>
          <div className="viva-header">
    <Link to="/">
      <img src="/logoblack.png" alt="Logo" className="viva-logo" />
    </Link>      </div>
      <h2 className={styles.title}>Instructor Registration</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formWrapper}>
          {/* Left Column */}
          <div className={styles.formColumn}>
            <label>Instructor ID</label>
            <input
              type="text"
              name="instructorID"
              value={formData.instructorID}
              onChange={handleChange}
              required
            />

            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Department</label>
<select
  name="department"
  value={formData.department}
  onChange={handleChange}
  required
>
  <option value="">-- Select Department --</option>
  <option value="Computer Science">Computer Science</option>
  <option value="Information Systems">Information Systems</option>
  <option value="Software Engineering">Software Engineering</option>
  <option value="Data Science">Data Science</option>
  <option value="Cyber Security">Cyber Security</option>
  <option value="Business Management">Business Management</option>
  <option value="Networking">Networking</option>
</select>

          </div>

          {/* Right Column */}
          <div className={styles.formColumn}>
            <label>Phone Number</label>
            <div style={{ position: "relative" }}>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                pattern="[0-9]{10}"
                disabled={phoneVerified}
                required
              />
              {!phoneVerified ? (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className={styles.verifyBtn}
                  style={{ position: "absolute", right: 0, top: 0 }}
                >
                  Verify Phone
                </button>
              ) : (
                <div className={styles.verifiedLabel}>✔ Verified</div>
              )}
            </div>

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={validationStatus.match ? styles.valid : ""}
            />

            <ul className={styles.passwordRules}>
              <li className={validationStatus.length ? styles.valid : styles.invalid}>
                At least 8 characters
              </li>
              <li className={validationStatus.uppercase ? styles.valid : styles.invalid}>
                At least one uppercase letter
              </li>
              <li className={validationStatus.lowercase ? styles.valid : styles.invalid}>
                At least one lowercase letter
              </li>
              <li className={validationStatus.number ? styles.valid : styles.invalid}>
                At least one number
              </li>
              <li className={validationStatus.match ? styles.valid : styles.invalid}>
                Passwords match
              </li>
            </ul>
          </div>
        </div>

        <button type="submit" disabled={!isPasswordValid || !phoneVerified}>
          Register
        </button>
      </form>

  {showOTPModal && (
  <div className="otp-overlay">
    <div className="otp-modal">
      <h2 className="otp-title">OTP Verification</h2>
      <p className="otp-subtitle">
        We’ve sent a 6-digit OTP to <strong>{formData.contact}</strong>
      </p>

      <img src="/otpverify.png" alt="OTP Verification" className="otp-image" />

      <div className="otp-input-group">
        {otpInput.map((digit, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={digit}
            className="otp-digit-box"
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              if (val) {
                const updated = [...otpInput];
                updated[index] = val;
                setOtpInput(updated);
                const next = e.target.nextSibling;
                if (next) next.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace") {
                const updated = [...otpInput];
                updated[index] = "";
                setOtpInput(updated);
                if (index > 0 && !otpInput[index]) {
                  const prev = e.target.previousSibling;
                  if (prev) prev.focus();
                }
              }
            }}
          />
        ))}
      </div>

      <div className="otp-resend-text">
        {resendCountdown > 0 ? (
          <p className="countdown-text">
            Didn’t receive the OTP? Resend available in <strong>{resendCountdown}s</strong>
          </p>
        ) : (
          <p className="resend-link-text" onClick={handleResendOTP}>
            Didn’t receive the OTP? <span>Click here to resend</span>
          </p>
        )}
      </div>

      <div className="otp-error-container">
        {otpErrorMessage && (
          <div className="otp-error-message">{otpErrorMessage}</div>
        )}
        <br></br>
      </div>

      <div className="otp-btn-group">
        <button onClick={handleVerifyOTP}>Verify</button>
        <button onClick={() => setShowOTPModal(false)}>Change Number</button>
      </div>
    </div>
  </div>
)}




    </div>

      <footer className="viva-footer">
        <p>
          &copy; {new Date().getFullYear()} VES Evaluations | Automated Viva
          Evaluation System. All rights reserved.
        </p>
      </footer>


{showSuccessOverlay && (
  <div className={styles.successOverlay}>
    <div className={styles.successModal}>
      <h2>Creating Your Dashboard...</h2>
      <p className={styles.typingEffect}>{successStep}</p>
    </div>
  </div>
)}


    </div>
  );
}
