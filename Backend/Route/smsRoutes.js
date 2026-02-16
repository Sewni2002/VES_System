// Route/smsRoutes.js
const express = require('express');
const router = express.Router();
const ShoutoutClient = require('shoutout-sdk');

// Your real API key
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZDgwOTQ5MC02MTE4LTExZWYtOWEzYi04OTc0YjdjNWE1YWQiLCJzdWIiOiJTSE9VVE9VVF9BUElfVVNFUiIsImlhdCI6MTcyNDM5NDE2NywiZXhwIjoyMDM5OTI2OTY3LCJzY29wZXMiOnsiYWN0aXZpdGllcyI6WyJyZWFkIiwid3JpdGUiXSwibWVzc2FnZXMiOlsicmVhZCIsIndyaXRlIl0sImNvbnRhY3RzIjpbInJlYWQiLCJ3cml0ZSJdfSwic29fdXNlcl9pZCI6IjU3NTI2MCIsInNvX3VzZXJfcm9sZSI6InVzZXIiLCJzb19wcm9maWxlIjoiYWxsIiwic29fdXNlcl9uYW1lIjoiIiwic29fYXBpa2V5Ijoibm9uZSJ9.HM0SnP5ndIr2owXfNEjGK9b0kLHb4rkgEStaYxbKmZE';

// Create client instance
const client = new ShoutoutClient(apiKey, true, false);

/**
 * POST /api/sms/send
 * Body: { phoneNumber: string, message: string }
 */
router.post('/send', (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({
            status: 'error',
            message: 'phoneNumber and message are required'
        });
    }

    // Ensure country code (example: Sri Lanka +94)
    let formattedNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
        formattedNumber = '+94' + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith('+')) {
        formattedNumber = '+94' + phoneNumber;
    }

    const smsPayload = {
        source: 'FITGO',  // sender ID
        destinations: [formattedNumber],
        content: { sms: message },
        transports: ['sms']
    };

    client.sendMessage(smsPayload, (error, result) => {
        if (error) {
            console.error('SMS send error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to send SMS',
                error: error
            });
        } else {
            console.log('SMS sent:', result);
            return res.json({
                status: 'success',
                message: 'SMS sent successfully',
                result: result
            });
        }
    });
});

module.exports = router;
