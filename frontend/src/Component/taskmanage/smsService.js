import API from '../../api'
/**
 * Sends a custom SMS
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Custom message to send
 */
const sendSms = async (phoneNumber, message) => {
  try {
    const response = await API.post('/api/sms/send', {
      phoneNumber,
      message
    });

    if (response.data.status === 'success') {
      alert('SMS sent successfully!');
    } else {
      console.error('SMS send failed:', response.data.error);
      alert('Failed to send SMS.');
    }
  } catch (error) {
    console.error('SMS send error:', error);
    alert('Failed to send SMS.');
  }
};

export default sendSms;
