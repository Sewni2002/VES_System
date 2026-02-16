import React, { useState } from 'react';
import axios from 'axios';
import './AttendanceForm.css'; 

function AttendanceForm() {
  const [form, setForm] = useState({ sessionId: '', studentId: '', status: '' });

  const submit = async () => {
    await axios.post('http://localhost:5000/api/scheduler/attendance', form);
    alert('Attendance marked');
  };

  return (
    <div className="attendance-container">
      <h2 className="attendance-heading">Mark Attendance</h2>
      <input
        className="attendance-input"
        placeholder="Session ID"
        onChange={e => setForm({...form, sessionId: e.target.value})}
      />
      <input
        className="attendance-input"
        placeholder="Student ID"
        onChange={e => setForm({...form, studentId: e.target.value})}
      />
      <select
        className="attendance-select"
        onChange={e => setForm({...form, status: e.target.value})}
      >
        <option value="">Select Status</option>
        <option>Present</option>
        <option>Late</option>
        <option>Absent</option>
      </select>
      <button className="attendance-button" onClick={submit}>Submit</button>
    </div>
  );
}

export default AttendanceForm;
