import React, { useState } from 'react';
import axios from 'axios';
import './UnavailabilityForm.css'; // import the CSS file

function UnavailabilityForm() {
  const [form, setForm] = useState({ instructorId: '', fromDate: '', toDate: '', reason: '' });

  const submit = async () => {

     if (!form.instructorId.trim() || !form.fromDate || !form.toDate || !form.reason.trim()) {
      alert("All fields are required.");
      return;
    }

    if (new Date(form.fromDate) > new Date(form.toDate)) {
      alert("From Date cannot be later than To Date.");
      return;
    }


    
    try {
     await axios.post('/api/unavailability/create', form);

      alert('Unavailability recorded');
      setForm({ instructorId: '', fromDate: '', toDate: '', reason: '' }); // clear form
    } catch (err) {
      alert('Error: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="unavailability-container">
      <h2 className="unavailability-heading">Mark Instructor Unavailability</h2>
      
      <input
        className="unavailability-input"
        placeholder="Instructor ID"
        value={form.instructorId}
        onChange={e => setForm({ ...form, instructorId: e.target.value })}
      />

      <input
        className="unavailability-input"
        type="date"
        value={form.fromDate}
        onChange={e => setForm({ ...form, fromDate: e.target.value })}
      />

      <input
        className="unavailability-input"
        type="date"
        value={form.toDate}
        onChange={e => setForm({ ...form, toDate: e.target.value })}
      />

      <input
        className="unavailability-input"
        placeholder="Reason"
        value={form.reason}
        onChange={e => setForm({ ...form, reason: e.target.value })}
      />

      <button className="unavailability-button" onClick={submit}>Submit</button>
    </div>
  );
}

export default UnavailabilityForm;
