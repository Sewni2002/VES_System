import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../api'
import API from '../../api';
import sendSms from './smsService';
 

function TodaySessions() {
  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    try {
     const res = await API.get('/api/scheduler/today');

      setSessions(res.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Send Email Reminder for a session
  const sendEmailReminder = async (session) => {
    try {
      await API.post('/api/scheduler/reminder/email', {
        to: 'isiwarawijesinghe2@gmail.com',  // Replace 
        subject: `Reminder: Your session "${session.groupTopic}" is coming up`,
        text: `Dear student,\n\nThis is a reminder for the session "${session.groupTopic}" scheduled at ${new Date(session.scheduledDateTime).toLocaleString()} in ${session.hallNumber}.\n\nNotes: ${session.notes || "None"}\n\nBest regards,\nInstructor Team`
      });
      alert('Email reminder sent successfully!');
    } catch (error) {
      console.error("Email reminder error:", error);
      alert('Failed to send email reminder.');
    }
  };

  // Send SMS Reminder for a session
  const sendSmsReminder = async (session) => {

  const message = `Dear Student, 
Reminder: Session "${session.groupTopic}" at ${new Date(session.scheduledDateTime).toLocaleTimeString()} in ${session.hallNumber}.`;
    const studentPhone =  "0757125515"

     sendSms(studentPhone, message);

  };


  
  React.useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 style={{fontSize:"1.5rem"}}>Today's Sessions</h2>
      <ul>
        {sessions.map(s => (
          <li key={s._id} style={{ marginBottom: '20px' }}>
            <strong>Group {s.groupId} - {s.groupTopic}</strong> at {new Date(s.scheduledDateTime).toLocaleTimeString()} in {s.hallNumber}
            <br />
            Instructor: {s.instructorName} | Substitute: {s.substituteInstructor || 'N/A'}
            <br />
            Notes: {s.notes || 'None'}
            <br /><br />
          <button
  onClick={() => sendEmailReminder(s)}
  style={{
    marginRight: "10px",
    padding: "8px 16px",
    backgroundColor: "#000000ff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#006a27ff")}
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000000ff")}
>
  Send Email Reminder
</button>

<button
  onClick={() => sendSmsReminder(s)}
  style={{
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#0a0a0aff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#006a27ff")}
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000000ff")}
>
  Send SMS Reminder
</button>

          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodaySessions;
