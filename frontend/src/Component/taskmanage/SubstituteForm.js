import React, { useState } from 'react';
import axios from 'axios';
import './SubstituteForm.css';

function SubstituteForm() {
  const [groupId, setGroupId] = useState('');
  const [instructorId, setInstructorId] = useState('');

  const submit = async () => {
    if (!groupId.trim() || !instructorId.trim()) {
      alert("Both Group ID and Instructor ID are required.");
      return;
    }

    try {
      await axios.put(`/api/scheduler/substitute/by-group/${groupId}`, { instructorId });
      alert('Substitute assigned successfully!');
      setGroupId('');
      setInstructorId('');
    } catch (error) {
      console.error("Error assigning substitute:", error);
      alert("Failed to assign substitute.");
    }
  };

  return (
    <div className="substitute-container">
      <h2 className="substitute-heading">Assign Substitute Instructor</h2>
      
      <input
        className="substitute-input"
        value={groupId}
        placeholder="Group ID"
        onChange={e => setGroupId(e.target.value)}
      />
      
      <input
        className="substitute-input"
        value={instructorId}
        placeholder="Substitute Instructor ID"
        onChange={e => setInstructorId(e.target.value)}
      />
      
      <button className="substitute-button" onClick={submit}>Assign</button>
    </div>
  );
}

export default SubstituteForm;
