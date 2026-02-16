const express = require("express");
const router = express.Router();
const { sendOTPViaWhatsApp, verifyOTP } = require("../Util/whatsAppOtpSender");

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const result = await sendOTPViaWhatsApp(phone);
  if (result.success) return res.send("OTP sent successfully");
  res.status(500).send("Failed to send OTP");
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  const isValid = verifyOTP(phone, otp);
  if (isValid) return res.send("OTP verified");
  res.status(400).send("Invalid OTP");
});

module.exports = router;
