// routes/directPayRoute.js
const express = require("express");
const crypto = require("crypto");
const router = express.Router();

router.post("/initiate", (req, res) => {
  const { fname, lname, email, phone, amount } = req.body;

  const merchant_id = "PI11698";
  const secret_key = "e323367ed65ed033115ff27555a418fd4f0e534067c49e0a10b9949a871427a0";

  const order_id = "ORDER" + Math.floor(100000 + Math.random() * 900000);
console.log(order_id);


  const payload = {
    merchant_id,
    amount,
    type: "ONE_TIME",
    order_id: order_id,
    currency: "LKR",
    response_url: "http://localhost:3000/payment-success",
    first_name: fname,
    last_name: lname,
    email,
    phone,
    logo: "", // Optional
  };

  const jsonPayload = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonPayload).toString("base64");

  const hmac = crypto.createHmac("sha256", secret_key);
  hmac.update(encodedPayload);
  const signature = hmac.digest("hex");

  res.json({ encodedPayload, signature });
});

module.exports = router;
