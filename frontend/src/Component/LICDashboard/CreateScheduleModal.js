import "./CreateScheduleModal.css";
import { useState, useEffect } from "react";

export default function CreateScheduleModal({ show, onClose, formData, setFormData, handleSubmit, groups }) {
  const [instructors, setInstructors] = useState([]);
  const [halls, setHalls] = useState([]);
const [scheduleCount, setScheduleCount] = useState(null);
const [timeSelected, setTimeSelected] = useState(false);

  useEffect(() => {
    if (show) {
      const fetchInstructors = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/instructors");
          const data = await res.json();
          setInstructors(data);
        } catch (err) {
          console.error("Failed to load instructors", err);
        }
      };
      fetchInstructors();
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      const fetchHalls = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/halls");
          const data = await res.json();
          setHalls(data.halls || []);
        } catch (err) {
          console.error("Failed to load halls", err);
        }
      };
      fetchHalls();
    }
  }, [show]);

  const checkScheduleCount = async () => {
  if (!formData.scheduledDateTime || !formData.startTime || !formData.endTime) return;

  try {
    const res = await fetch(
      `http://localhost:5000/api/schedulercountvindy/count?date=${formData.scheduledDateTime}&startTime=${formData.startTime}&endTime=${formData.endTime}`
    );
    const data = await res.json();
    setScheduleCount(data.count);
  } catch (err) {
    console.error('Failed to get schedule count', err);
  }
};



useEffect(() => {
  checkScheduleCount();
}, [formData.scheduledDateTime, formData.startTime, formData.endTime]);


  if (!show) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="cs-modal-overlay">
      <div className="cs-modal">
        <div className="cs-modal-header">
          <h3>Create New Schedule</h3>
        </div>
        <form onSubmit={handleSubmit} className="cs-modal-form">

          {/* Group dropdown */}
          <div>
            <label>Group Name</label>
            <select
              required
              value={formData.groupId}
              onChange={(e) => {
                const selectedId = e.target.value;
                const group = groups.find((g) => g.gid === selectedId);
                setFormData({
                  ...formData,
                  groupId: selectedId,
                  groupMembers: group ? group.members.join(", ") : "",
                });
              }}
            >
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.gid} value={g.gid}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>

          {/* Hall Number dropdown */}
          <div>
            <label>Hall Number</label>
            <select
              required
              value={formData.hallNumber}
              onChange={(e) => setFormData({ ...formData, hallNumber: e.target.value })}
            >
              <option value="">Select Hall</option>
              {halls.map((h) => (
                <option key={h._id} value={h.hallNumber}>
                  {h.hallNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Group Topic */}
          <div>
            <label>Group Topic</label>
            <input
              type="text"
              placeholder="Group Topic"
              required
              value={formData.groupTopic}
              onChange={(e) => setFormData({ ...formData, groupTopic: e.target.value })}
            />
          </div>

          <div>
            <label>Session ID</label>
            <input
              type="text"
              placeholder="Session ID"
              required
              value={formData.sessionId}
              onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
            />
          </div>

          {/* Scheduled Date */}
          <div>
            <label>Scheduled Date</label>
            <input
              type="date"
              required
              value={formData.scheduledDateTime}
              min={todayStr}
              onChange={(e) => setFormData({ ...formData, scheduledDateTime: e.target.value })}
            />
          </div>

          {/* Start Time - Simple time input */}
          <div>
            <label>Start Time</label>
            <input
  type="time"
  required
  value={formData.startTime}
  onChange={(e) => {
    setFormData({ ...formData, startTime: e.target.value });
    setTimeSelected(true); // mark that the user has selected/changed the time
  }}
  step="300" // 5-minute intervals
/>

          </div>

          {/* End Time - Simple time input */}
          <div>
            <label>End Time</label>
           <input
  type="time"
  required
  value={formData.endTime}
  onChange={(e) => {
    setFormData({ ...formData, endTime: e.target.value });
    setTimeSelected(true); // mark that the user has selected/changed the time
  }}
  step="300" // 5-minute intervals
  min={formData.startTime} // Prevent end time before start time
/>

          </div>
<div style={{ marginTop: "10px" }}>
  {scheduleCount !== null && (
    <p style={{ 
      fontSize: "14px", 
      fontWeight: "bold", 
      color: scheduleCount > 0 ? "red" : "green" 
    }}>
      {scheduleCount > 0
        ? `${scheduleCount} group${scheduleCount > 1 ? "s" : ""} already scheduled at this time.`
        : "This time slot is available."}
    </p>
  )}
</div>



          {/* Instructor Name */}
          <div className="full-width-input">
            <label>Instructor Name & Id</label>
            <select
              required
              value={formData.instructorId}
              onChange={(e) =>
                setFormData({ ...formData, instructorId: e.target.value })
              }
            >
              <option value="">Select Instructor</option>
              {instructors.map((ins) => (
                <option key={ins._id} value={ins.instructorID}>
                  {ins.instructorID} - {ins.name}
                </option>
              ))}
            </select>
          </div>

          {/* Members (auto-fill) */}
          <div className="full-width-input">
            <label>Members (comma separated)</label>
            <input type="text" value={formData.groupMembers} readOnly />
          </div>

          {/* Notes (optional) */}
          <div className="full-width-input">
            <label>Notes (optional)</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="cs-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-p">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}