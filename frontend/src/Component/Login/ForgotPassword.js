import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from './ForgotPassword.module.css';
import { useNavigate } from "react-router-dom";

const PasswordReset = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: send OTP, 2: verify OTP, 3: reset password
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState(Array(6).fill(""));
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationStatus, setValidationStatus] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });
  const [loading, setLoading] = useState(false);

  // New states for success overlay & step message
  const [showPasswordResetOverlay, setShowPasswordResetOverlay] = useState(false);
const [progressStep, setProgressStep] = useState("");

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Validate password fields on change
  useEffect(() => {
    const length = newPassword.length >= 8;
    const uppercase = /[A-Z]/.test(newPassword);
    const lowercase = /[a-z]/.test(newPassword);
    const number = /[0-9]/.test(newPassword);
    const match = newPassword === confirmPassword && newPassword !== "";

    setValidationStatus({ length, uppercase, lowercase, number, match });
  }, [newPassword, confirmPassword]);

  const isPasswordValid = Object.values(validationStatus).every(Boolean);

  // Success overlay steps & redirect
 useEffect(() => {
  if (showPasswordResetOverlay) {
    const steps = [
      "Starting reset process...",
      "Verifying credentials...",
      "Updating password...",
      "Securing account...",
      "Almost done...",
      "Redirecting to login..."
    ];

    let index = 0;
    const intervalId = setInterval(() => {
      setProgressStep(steps[index]);
      index++;
      if (index >= steps.length) {
        clearInterval(intervalId);
        setTimeout(() => {
          setShowPasswordResetOverlay(false);
          navigate("/login");
        }, 1000);
      }
    }, 1400);

    return () => clearInterval(intervalId);
  }
}, [showPasswordResetOverlay, navigate]);

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/reset/forgot-password", { email });
      setPhone(res.data.phone || ""); // backend must send phone for UI display or handle differently
      setStep(2);
      setResendCountdown(60);
      setOtpInput(Array(6).fill(""));
      setOtpErrorMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val && otpInput[index] === "") return;
    const newOtp = [...otpInput];
    newOtp[index] = val;
    setOtpInput(newOtp);
    if (val && index < otpInput.length - 1) {
      e.target.nextSibling?.focus();
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async () => {
    const otpString = otpInput.join("");
    if (otpString.length < 6) {
      setOtpErrorMessage("Please enter the full 6-digit OTP");
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/reset/verify-otp", { email, otp: otpString });
      setStep(3);
      setOtpErrorMessage("");
    } catch (err) {
      setOtpErrorMessage(err.response?.data?.message || "Invalid OTP");
      setTimeout(() => setOtpErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset submit
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/reset/reset-password", { email, newPassword });
      // Show success overlay instead of alert
setShowPasswordResetOverlay(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/reset/forgot-password", { email });
      setResendCountdown(60);
      setOtpInput(Array(6).fill(""));
      setOtpErrorMessage("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetContainer}>
      <img
        src="/logoblack.png"
        alt="Logo"
        className={styles.logo}
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      />

      {step === 1 && (
        <>
          <h2>Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <button disabled={loading} onClick={handleSendOTP}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Enter OTP</h2>
          <p>We sent a 6-digit OTP to your registered phone number: <strong>{phone}</strong></p>

          <div className={styles.otpInputGroup}>
            {otpInput.map((digit, i) => (
              <input
                key={i}
                maxLength={1}
                className={styles.otpDigitBox}
                value={digit}
                onChange={(e) => handleOtpChange(e, i)}
                type="text"
                inputMode="numeric"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {otpErrorMessage && <div className={styles.errorMessage}>{otpErrorMessage}</div>}

          <div>
            {resendCountdown > 0 ? (
              <p>Resend OTP in {resendCountdown} seconds</p>
            ) : (
              <button className={styles.resendLink} onClick={handleResendOTP} disabled={loading}>
                Resend OTP
              </button>
            )}
          </div>

          <button disabled={loading} onClick={handleVerifyOTP}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2>Reset Password</h2>
          <form onSubmit={handleResetPassword} className={styles.passwordForm}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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

            <button type="submit" disabled={!isPasswordValid || loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
      )}

    
   {showPasswordResetOverlay && (
  <div className={styles.resetOverlay}>
    <div className={styles.passwordResetCompleteModal}>
      <h2>Password Reset Completed</h2>
      <p className={styles.progressMessage}>{progressStep}</p>
    </div>
  </div>
)}


  <footer className="viva-footer">
        <p>
          &copy; {new Date().getFullYear()} VES Evaluations | Automated Viva
          Evaluation System. All rights reserved.
        </p>
      </footer>

      
    </div>

    
  );
};

export default PasswordReset;
