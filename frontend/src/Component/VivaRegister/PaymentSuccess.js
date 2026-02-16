import React, { useEffect, useState } from "react";
import axios from "axios";

const PaymentSuccess = () => {
  const [countdown, setCountdown] = useState(5);
  const studentID = localStorage.getItem("studentID");
  const academicYear = localStorage.getItem("academicYear");
  const semester = localStorage.getItem("semester");

  useEffect(() => {
    // Update payment status on backend
    const updatePaymentStatus = async () => {
      try {
        await axios.post("http://localhost:5000/api/viva/update-payment-status", {
          studentID,
          academicYear,
          semester,
        });
        console.log("Payment status updated successfully");
      } catch (error) {
        console.error("Failed to update payment status", error);
      }
    };

    updatePaymentStatus();

    // Countdown timer for redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = "/login"; // Redirect to dashboard
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [studentID, academicYear, semester]);

  return (
    <div style={{
      maxWidth: "500px",
      margin: "auto",
      padding: "2rem",
      textAlign: "center",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      backgroundColor: "#f9f9fb",
      marginTop: "50px"
    }}>
      <h2 style={{ color: "#2e7d32", marginBottom: "16px" }}>✅ Payment Successful</h2>
      <p>Thank you! Your payment has been received.</p>
      <p>
        Your dashboard will be ready shortly.Please Re-Log Redirecting in {countdown} seconds...
      </p>
      <button
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: "#2e7d32",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          transition: "background-color 0.3s ease"
        }}
        onClick={() => (window.location.href = "/login")}
      >
        Click here if not redirected
      </button>
    </div>
  );
};

export default PaymentSuccess;
