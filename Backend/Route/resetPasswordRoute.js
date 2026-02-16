const express = require("express");
const router = express.Router();
const {
  handleForgotPassword,
  handleVerifyOTP,
  handleResetPassword
} = require("../Controllers/resetPasswordController");

router.post("/forgot-password", handleForgotPassword);
router.post("/verify-otp", handleVerifyOTP);
router.post("/reset-password", handleResetPassword);

module.exports = router;
