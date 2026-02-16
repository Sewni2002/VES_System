
import axios from "axios";



export const sendOTPViaWhatsApp = async (phone,studentID) => {
  // Format phone number
  if (phone.startsWith("0")) phone = "94" + phone.slice(1);
  if (!phone.startsWith("94")) phone = "94" + phone;
  phone = phone.replace("+", "");
  
  
  const systemName = "Viva Evaluation System (VES System)";
  const supportEmail = "support@ves-system.com";
  const dashboardLink = "https://ves-system.com/login";

const message = 
`${systemName} – Account Created ✅

Dear Student,

Your account has been successfully created and activated.

📌 Student ID: ${studentID}
📌 Status: Active

You can now log in to your student dashboard to:
- View allocated viva sessions
- Upload and manage your project files
- Track evaluation progress and deadlines

🌐 Access your dashboard here: ${dashboardLink}

If you face any issues, please contact us at ${supportEmail}.

Thank you,
${systemName} Team`;

/**
 * Sends a One-Time Password (OTP) message via WhatsApp using the Waclient API.
 *
 * This function builds a JSON payload with recipient details, message content, 
 * and authentication credentials (instance ID and access token). It sends the request 
 * to the Waclient API endpoint and handles both successful and failed responses.
 *
 * Features:
 * - Accepts a phone number, OTP, and message to be sent via WhatsApp.
 * - Constructs the payload required by the Waclient API.
 * - Sends an HTTP POST request with JSON headers.
 * - Returns the API response on success or error details on failure.
 *
 * Parameters:
 * @param {string} phone   - The recipient's mobile number (must include country code, e.g., "94771234567").
 * @param {string} otp     - The one-time password to send (e.g., "123456").
 * @param {string} message - The message body to send along with the OTP.
 *
 * @returns {Promise<Object>} Response object:
 *   - { success: true, otp, response } on success.
 *   - { success: false, error } on failure.
 *
 * References:
 * - Waclient API Documentation: https://waclient.com/docs/
 * - Axios HTTP Client: https://axios-http.com/docs/intro
 */


   const payload = {
    number: phone,
    type: "text",
    message: message,
    instance_id: "68AE6F82A5A43", // env var recommended
    access_token: "68ae6f2db3bcf", // env var recommended
  };

  try {
    const response = await axios.post("https://waclient.com/api/send", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return { success: true, otp, response: response.data };
  } catch (err) {
    console.error("OTP send error:", err.message);
    return { success: false, error: err.message };
  }
};




