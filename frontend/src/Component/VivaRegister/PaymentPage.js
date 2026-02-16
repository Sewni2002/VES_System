import React, { useEffect, useState } from "react";
import "./PaymentPage.css"; 


const PaymentPage = () => {
  const [studentID, setStudentID] = useState("");

  useEffect(() => {
    const encodedPayload = localStorage.getItem("dp_payload");
    const signature = localStorage.getItem("dp_signature");
    const storedID = localStorage.getItem("studentID");

    if (storedID) setStudentID(storedID);

    const script = document.createElement("script");
    script.src = "https://cdn.directpay.lk/v3/directpayipg.min.js";
    script.onload = () => {
      const dp = new window.DirectPayIpg.Init({
        signature,
        dataString: encodedPayload,
        stage: "PROD",
        container: "card_container",
      });

      dp.doInContainerCheckout()
        .then((data) => {
          console.log("Payment Success:", data);
          window.location.href = "/payment-success";
        })
        .catch((error) => {
          console.error("Payment Error:", error);
        });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="payment-page">
      <header className="payment-header">
        <div className="logo-section">
          <img src="/logo.png" alt="Logo" className="logo-image" />
          <span className="portal-title">Payment Portal</span>
        </div>
        <div className="student-info">
          Student ID: <strong>{studentID}</strong>
        </div>
      </header>

      <div id="card_container" style={{ marginTop: "20px" }}></div>
      
    </div>
  );
};

export default PaymentPage;
