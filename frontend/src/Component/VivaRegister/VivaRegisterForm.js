import React, { useEffect, useState } from "react";
import axios from "axios";
import "./vivaregisterform.css";
import { Link } from "react-router-dom";

const VivaRegisterForm = () => {
  const [student, setStudent] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [photo, setPhoto] = useState(null);
  const [phone, setPhone] = useState("");

  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const studentID = localStorage.getItem("studentID");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
const [religion, setReligion] = useState("");
const [gender, setGender] = useState("");


  const [validationStatus, setValidationStatus] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false,
  });

  const isPasswordValid =
  validationStatus.length &&
  validationStatus.uppercase &&
  validationStatus.lowercase &&
  validationStatus.number &&
   validationStatus.match;

   //state varibale array to check password
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const resetPasswordValidation = () => {
    setValidationStatus({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      match: false,
    });
  };

  const checkPasswordStandard = (pwd) => {
    setPasswordsMatch(pwd === confirmPassword && confirmPassword !== "");
  };

  const removeCPasswordError = () => {
    document.getElementById("cpassword").className = "noterror";
  };

//Countdown timer for OTP resend
  useEffect(() => {
  let timer;
  if (showOTPModal && resendCountdown > 0) {
    timer = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
  }
  return () => clearTimeout(timer);
}, [resendCountdown, showOTPModal]);



  useEffect(() => {
    setPasswordsMatch(
      newPassword === confirmPassword && confirmPassword !== ""
    );
  }, [confirmPassword, newPassword]);
  useEffect(() => {
    const length = newPassword.length >= 8;
    const uppercase = /[A-Z]/.test(newPassword);
    const lowercase = /[a-z]/.test(newPassword);
    const number = /\d/.test(newPassword);
    const match =
      newPassword && confirmPassword && newPassword === confirmPassword;

    setValidationStatus({ length, uppercase, lowercase, number, match });
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/student/${studentID}`
        );
        setStudent(res.data);
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };

    if (studentID) fetchStudent();
  }, [studentID]);

  //to show the loading overlay
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setShowLoading(false), 2000);
  }, []);
const handleResendOTP = async () => {
  try {
    await axios.post("http://localhost:5000/api/otp/send-otp", { phone });
    //alert("New OTP sent to WhatsApp");
    setOtpInput("".padEnd(6));
    setResendCountdown(60);
  } catch (err) {
    console.error(err);
    alert("Failed to resend OTP");
  }
};
  const handleSendOTP = async () => {
  try {
    await axios.post("http://localhost:5000/api/otp/send-otp", { phone });
   // alert("OTP sent to WhatsApp");
    setShowOTPModal(true);
  } catch (err) {
    console.error(err);
    alert("Failed to send OTP");
  }
};

const handleVerifyOTP = async () => {
  try {
    await axios.post("http://localhost:5000/api/otp/verify-otp", {
      phone,
      otp: otpInput,
    });
    //alert("OTP Verified!");
    setPhoneVerified(true);
    setShowOTPModal(false);
  } catch (err) {
    setOtpErrorMessage("❌ Invalid OTP. Please try again.");

 setTimeout(() => {
      setOtpErrorMessage("");
    }, 4000);
  

  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student || !academicYear || !semester || !photo) {
      alert("Please complete all required fields.");
      return;
    }

    if (changePassword) {
      if (!newPassword || !confirmPassword) {
        alert("Please fill both password fields.");
        setNewPassword("");
        setConfirmPassword("");
        resetPasswordValidation();

        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        setNewPassword("");
        setConfirmPassword("");
        resetPasswordValidation();

        return;
      }

      const isStrong =
        newPassword.length >= 8 &&
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /\d/.test(newPassword);

      if (!isStrong) {
        alert("Password is not strong enough.");
        setNewPassword("");
        setConfirmPassword("");
        resetPasswordValidation();

        return;
      }
    }

    const formData = new FormData();
    formData.append("studentID", studentID);
    formData.append("academicYear", academicYear);
    formData.append("semester", semester);
    formData.append("photo", photo);
    formData.append("phone", phone);
    formData.append("iname", student.iname);
    formData.append("fname", student.fname);
formData.append("religion", religion.trim());
formData.append("gender", gender); 
    formData.append("gpa", student.currentGPA);


    if (changePassword) {
      formData.append("password", newPassword);
    }

    if (!religion) {
  alert("Please select your religion before proceeding.");
  return;
}

    localStorage.setItem("academicYear", academicYear);
    localStorage.setItem("semester", semester);

    try {
      await axios.post("http://localhost:5000/api/viva/viva-register", formData);
      //alert("Viva registration successful!");

      const response = await axios.post(
        "http://localhost:5000/api/directpay/initiate",
        {
          fname: student.iname,
          lname: student.fname,
          email: student.email,
          phone: phone,
          amount: "20",
        }
      );

      const { encodedPayload, signature } = response.data;
      localStorage.setItem("dp_payload", encodedPayload);
      localStorage.setItem("dp_signature", signature);
      window.location.href = "/payment";
    } catch (err) {
      console.error("Viva registration failed:", err);
      alert("Something went wrong.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (!student || showLoading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.85)",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          flexDirection: "column",
        }}
      >
        <div className="loader"></div>
       <p style={{ marginTop: "40px", fontSize: "18px", fontWeight: "500" , color:"white"}}>
  Loading student info {studentID ? ` for ID: ` : "..."}
  {studentID && <span >{studentID}</span>} 
</p>

      </div>
    );
  }

  return (
    <div className="viva-form" style={{ maxWidth: "900px", margin: "auto" }}>
      <div className="viva-header">
<Link to="/">
  <img src="/logoblack.png" alt="Logo" className="viva-logo" />
</Link>      </div>

      <div className="viva-instructions">
        <h3>Instructions - Registration</h3>
        <p>
          A registration fee of <strong>Rs. 250</strong> is charged for the
          examination. You can pay the fee securely via{" "}
          <strong>card payment</strong> after submitting this form.
        </p>
        <p>
          This system is part of an{" "}
          <strong>Automated Viva Evaluation System</strong> designed to
          streamline the evaluation process. Make sure to upload a clear photo
          of yours for identification.
        </p>
        <p>
          If you wish to update your password, you may use the checkbox provided
          below. Please ensure all required fields are filled before proceeding.
        </p>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-wrapper">
          {/* Left Section */}
          <div className="form-column left-column">
            <div>
              <label>Student ID:</label>
              <input type="text" value={student.studentID} readOnly />
            </div>

            <div>
              <label>Email:</label>
              <input type="email" value={student.email} readOnly />
            </div>

            <div>
              <label>First Name:</label>
              <input
                type="text"
                value={student.iname}
                onChange={(e) =>
                  setStudent({ ...student, fname: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>Last Name:</label>
              <input
                type="text"
                value={student.fname}
                onChange={(e) =>
                  setStudent({ ...student, iname: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label>Upload Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                required
              />
            </div>
                <label>Phone:</label>

<div

  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    marginTop: "10px",
  }}
>

  <input
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
    maxLength="10"
    required
    placeholder="Enter phone number"
    disabled={phoneVerified}
    style={{
      flex: "1",
      padding: "10px 12px",
      fontSize: "15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      backgroundColor: phoneVerified ? "#f5f5f5" : "#fff",
      cursor: phoneVerified ? "not-allowed" : "text",
      height: "42px",
      boxSizing: "border-box",
    }}
  />

  {!phoneVerified ? (
    <button
      type="button"
      onClick={handleSendOTP}
      disabled={phone.length !== 10}
      style={{
        padding: "10px 20px",
        fontSize: "15px",
        fontWeight: "500",
        backgroundColor: phone.length === 10 ? "#000" : "#d3d3d3",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: phone.length === 10 ? "pointer" : "not-allowed",
        height: "42px",
        transition: "0.3s",
        width: "160px",
        marginTop:"8px",
        marginBottom:"10px"
      }}
    >
      Verify Phone
    </button>
  ) : (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e6ffe6",
        border: "1px solid #28a745",
        borderRadius: "5px",
        padding: "10px 10px",
        color: "#28a745",
        fontWeight: "600",
        height: "22px",
        marginTop:"14px",
        width: "160px",
      }}
    >
      <i className="fas fa-check-circle" style={{ marginRight: "6px" }}></i>
      Verified
    </div>
  )}
</div>



  
<div className="form-group">
  <label>Religion:</label>
  <select
    name="religion"
    value={religion}
    onChange={(e) => setReligion(e.target.value)}
    required
    style={{
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "15px",
    }}
  >
    <option value="">-- Select Religion --</option>
    <option value="Buddhism">Buddhism</option>
    <option value="Christianity">Christianity</option>
    <option value="Hinduism">Hinduism</option>
    <option value="Islam">Islam</option>
    <option  style={{marginBottom:"25px"}} value="Other">Other</option>
  </select>
</div>



      <div className="form-group">
  <label >Gender</label>
  <select
    name="gender"
    value={gender}
    onChange={(e) => setGender(e.target.value)}
    required 
  >
    <option value="">-- Select Gender --</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

</div>   
          {/* Right Section */}
          <div className="form-column right-column">

<div className="form-group">
  <label htmlFor="currentGPA">Current GPA</label>
  <input
    type="number"
    id="currentGPA"
    name="currentGPA"
    value={student?.currentGPA || 0}
    readOnly
    style={{
      backgroundColor: "#f0f0f0",
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "10px 12px",
      width: "94%",
      color: "#555",
      cursor: "not-allowed",
      marginBottom:"18px",
    }}
  />
</div>


            <div className="year-semester-wrapper">
              <div className="form-group">
                <label>Academic Year:</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  required
                >
                  <option value="">-Select Year-</option>
                  <option value="Y01">Year 01</option>
                  <option value="Y02">Year 02</option>
                  <option value="Y03">Year 03</option>
                </select>
              </div>

              <div className="form-group">
                <label>Semester:</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                >
                  <option value="">-Select Semester-</option>
                  <option value="Sem01">Semester 01</option>
                  <option value="Sem02">Semester 02</option>
                </select>
              </div>


             

            </div>


      
<div className="checkbox-row">
  <div className="checkbox-item">
    <input 
      type="checkbox" 
      checked={changePassword} 
      onChange={() => setChangePassword(!changePassword)} 
      id="changePassword"
    />
    <label htmlFor="changePassword">Change password</label>
  </div>

  <div className="checkbox-item">
    <input 
      type="checkbox" 
      id="terms" 
      required 
      onChange={(e) => setTermsAccepted(e.target.checked)} 
    />
    <label htmlFor="terms">I accept the Terms and Conditions</label>
  </div>
</div>



            {changePassword && (
              <div className="password-container">
                <p
                  style={{
                    color: "red",
                    fontWeight: "600",
                    padding: "5px",
                    textAlign: "justify",
                  }}
                >
                  Important: <br></br>
                  Updating your password through this form will synchronize the
                  change across all linked platforms and services.
                </p>

                <div className="password-flex-wrapper">
                  <div className="inputs">
                    <input
                      type="password"
                      id="password"
                      placeholder="Password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        checkPasswordStandard(e.target.value);
                      }}
                      required
                    />
                    <input
                      type="password"
                      id="cpassword"
                      placeholder="Re-enter Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyUp={removeCPasswordError}
                      required
                      style={{
                        border: passwordsMatch
                          ? "2px solid green"
                          : "1px solid #ccc",
                      }}
                    />
                  </div>

                  <div className="passwordcheck">
                    <ul>
                      <li
                        className={
                          validationStatus.length ? "valid" : "invalid"
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          validationStatus.uppercase ? "valid" : "invalid"
                        }
                      >
                        At least one uppercase letter
                      </li>
                      <li
                        className={
                          validationStatus.lowercase ? "valid" : "invalid"
                        }
                      >
                        At least one lowercase letter
                      </li>
                      <li
                        className={
                          validationStatus.number ? "valid" : "invalid"
                        }
                      >
                        At least one number
                      </li>
                      <li
                        className={validationStatus.match ? "valid" : "invalid"}
                      >
                        Passwords match
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

         <button
    type="submit"
    id="submit"
disabled={(!termsAccepted) || (changePassword && !isPasswordValid)}
    style={{
      cursor: (!termsAccepted) || (changePassword && !isPasswordValid) ? "not-allowed" : "pointer",
      opacity: !termsAccepted && changePassword && !isPasswordValid ? 0.5 : 1,
      marginTop: "20px"
    }}
  >
    Pay Fee by Card
  </button>
{showOTPModal && (
  <div className="otp-overlay">
    <div className="otp-modal">
      <h2 className="otp-title">OTP Verification</h2>
      <p className="otp-subtitle">We’ve sent a 6-digit OTP to <strong>{phone}</strong></p>

      <img
        src="/otpverify.png"
        alt="OTP Verification"
        className="otp-image"
      />

      <div className="otp-input-group">
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength="1"
            value={otpInput[i] || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, "");
              const updated = otpInput.split("");
              updated[i] = val;
              setOtpInput(updated.join(""));
              if (val && e.target.nextSibling) e.target.nextSibling.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !otpInput[i] && e.target.previousSibling) {
                e.target.previousSibling.focus();
              }
            }}
            className="otp-digit-box"
          />
        ))}
      </div>

 <div className="otp-resend-text">
  {resendCountdown > 0 ? (
    <p className="countdown-text">
      Didn't receive the OTP? Resend available in <strong>{resendCountdown}s</strong>
    </p>
  ) : (
    <p className="resend-link-text" onClick={handleResendOTP}>
      Didn't receive the OTP? <span>Click here to resend</span>
    </p>
  )}
</div>



<div className="otp-error-container">
  {otpErrorMessage && (
    <div className="otp-error-message">{otpErrorMessage}</div>
  )}
</div>

<div className="otp-btn-group" style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
  <button
    onClick={handleVerifyOTP}
    style={{
      background: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "10px 15px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.target.style.background = "#222")}
    onMouseOut={(e) => (e.target.style.background = "#000")}
  >
    Verify
  </button>

  <button
    onClick={() => setShowOTPModal(false)}
    style={{
      background: "#000",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "10px 15px",
      fontSize: "14px",
      cursor: "pointer",
      transition: "background-color 0.3s",
    }}
    onMouseOver={(e) => (e.target.style.background = "#222")}
    onMouseOut={(e) => (e.target.style.background = "#000")}
  >
    Change Number
  </button>
</div>

    </div>
  </div>
)}


          </div>
        </div>
      </form>
      <footer className="viva-footer">
        <p>
          &copy; {new Date().getFullYear()} VES Evaluations | Automated Viva
          Evaluation System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default VivaRegisterForm;
