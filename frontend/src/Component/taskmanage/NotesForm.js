import React, { useState } from 'react';
import axios from 'axios';
import './NotesForm.css'; 

function NotesForm() {
  const [groupId, setGroupId] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async () => {
    await axios.put(`/api/scheduler/notes/by-group/${groupId}`, { notes });
    alert('Notes updated');
  };

  return (
    <div className="notes-container">
      <h2 className="notes-heading">Add Notes to Session</h2>
      <input
        className="notes-input"
        placeholder="Group ID"
        onChange={e => setGroupId(e.target.value)}
      />
      <input
        className="notes-input"
        placeholder="Notes"
        onChange={e => setNotes(e.target.value)}
      />
      <button className="notes-button" onClick={submit}>Submit</button>
    </div>
  );
}

export default NotesForm;
