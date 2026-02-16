import React, { useEffect, useState } from "react";
import "./ScheduleDetail.css";
import { Users, User, MapPin, Notebook, Clock, Calendar, Hash } from "lucide-react";

function ScheduleDetailsModal({ show, onClose, scheduleId, onUpdate }) {
  const [schedule, setSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState({});
  const [loading, setLoading] = useState(false);
  const [halls, setHalls] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Fetch halls
  useEffect(() => {
    if (!show) return;
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
  }, [show]);

  // Fetch schedule details
  useEffect(() => {
    if (!show || !scheduleId) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/schedulerVD/${scheduleId}`);
        const data = await res.json();
        setSchedule(data);

        setEditedSchedule({
          hallNumber: data.hallNumber,
          scheduledDateTime: data.scheduledDateTime.slice(0, 10),
          startTime: data.startTime,
          endTime: data.endTime,
          groupTopic: data.groupTopic,
          notes: data.notes || "",
        });
      } catch (err) {
        console.error("Failed to load schedule details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [show, scheduleId]);

  useEffect(() => {
  if (!editedSchedule.hallNumber) {
    setAvailableDates([]);
    setAvailableSlots([]);
    return;
  }

  const hall = halls.find(h => h.hallNumber === editedSchedule.hallNumber);
  if (!hall) return;

  const today = new Date().toISOString().split("T")[0];

  let datesFromSlots = hall.slots.map(s => new Date(s.date).toISOString().split("T")[0]);

  datesFromSlots = datesFromSlots.filter(d => d >= today || d === editedSchedule.scheduledDateTime);

  const uniqueDates = [...new Set(datesFromSlots)].sort((a, b) => new Date(a) - new Date(b));

  setAvailableDates(uniqueDates);

  if (!uniqueDates.includes(editedSchedule.scheduledDateTime)) {
    setEditedSchedule(prev => ({ ...prev, scheduledDateTime: "", startTime: "", endTime: "" }));
  }
}, [editedSchedule.hallNumber, halls, editedSchedule.scheduledDateTime]);


  // Update available slots whenever hall or date changes
  useEffect(() => {
    if (!editedSchedule.hallNumber || !editedSchedule.scheduledDateTime) {
      setAvailableSlots([]);
      return;
    }

    const hall = halls.find(h => h.hallNumber === editedSchedule.hallNumber);
    if (!hall) return;

    const slots = hall.slots
      .filter(s => {
        const slotDate = new Date(s.date).toISOString().split("T")[0];
        const isCurrent = schedule &&
          s.startTime === schedule.startTime &&
          s.endTime === schedule.endTime &&
          slotDate === schedule.scheduledDateTime.slice(0, 10);
        return slotDate === editedSchedule.scheduledDateTime && (!s.booked || isCurrent);
      })
      .map(s => ({ startTime: s.startTime, endTime: s.endTime }));

    setAvailableSlots(slots);

    if (!slots.some(s => s.startTime === editedSchedule.startTime)) {
      setEditedSchedule(prev => ({ ...prev, startTime: "", endTime: "" }));
    }
  }, [editedSchedule.scheduledDateTime, editedSchedule.hallNumber, halls, schedule]);

  const isChanged = () => {
    if (!schedule) return false;
    return (
      schedule.scheduledDateTime.slice(0, 10) !== editedSchedule.scheduledDateTime ||
      schedule.startTime !== editedSchedule.startTime ||
      schedule.endTime !== editedSchedule.endTime ||
      schedule.groupTopic !== editedSchedule.groupTopic ||
      schedule.hallNumber !== editedSchedule.hallNumber ||
      (schedule.notes || "") !== editedSchedule.notes
    );
  };

  const handleUpdate = () => {
    onUpdate({ ...schedule, ...editedSchedule });
  };

  if (!show) return null;

  return (
    <div className="schdEviny-modal-overlay">
      <div className="schdEviny-modal">
        {loading && <p>Loading schedule details…</p>}

        {!loading && schedule && (
          <>
            <div className="schdEviny-modal-header">
              <input
                type="text"
                value={editedSchedule.groupTopic || ""}
                onChange={(e) => setEditedSchedule({ ...editedSchedule, groupTopic: e.target.value })}
                className="schdEviny-center-input"
              />
            </div>

            <div className="schdEviny-modal-grid">
              <div className="schdEviny-modal-left">
                <div className="schdEviny-detail-row">
                  <User className="schdEviny-icon" />
                  <span className="schdEviny-label">Instructor ID:</span>
                  <span className="schdEviny-value">{schedule.instructorId}</span>
                </div>

                <div className="schdEviny-detail-row">
                  <Hash className="schdEviny-icon" />
                  <span className="schdEviny-label">Session Id:</span>
                  <span className="schdEviny-value">{schedule.sessionId}</span>
                </div>

                <div className="schdEviny-detail-row">
                  <MapPin className="schdEviny-icon" />
                  <span className="schdEviny-label">Hall:</span>
                  <select
                    value={editedSchedule.hallNumber}
                    onChange={(e) => setEditedSchedule({ ...editedSchedule, hallNumber: e.target.value })}
                  >
                    <option value="">Select Hall</option>
                    {halls.map(h => (
                      <option key={h._id} value={h.hallNumber}>{h.hallNumber}</option>
                    ))}
                  </select>
                </div>

                <div className="schdEviny-detail-row-group">
                  <div className="schdEviny-detail-row">
                    <Users className="schdEviny-icon" />
                    <span className="schdEviny-label">Group Members:</span>
                  </div>
                  <ul className="schdEviny-group-list">
                    {schedule.groupMembers.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="schdEviny-modal-right">
                <div className="schdEviny-detail-row">
                  <Calendar className="schdEviny-icon" />
                  <span className="schdEviny-label">Date:</span>
                  <select
                    value={editedSchedule.scheduledDateTime}
                    onChange={(e) => setEditedSchedule({ ...editedSchedule, scheduledDateTime: e.target.value })}
                  >
                    <option value="">Select Date</option>
                    {availableDates.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="schdEviny-detail-row">
                  <Clock className="schdEviny-icon" />
                  <span className="schdEviny-label">Time:</span>
                  <select
                    value={editedSchedule.startTime}
                    onChange={(e) => {
                      const slot = availableSlots.find(s => s.startTime === e.target.value);
                      setEditedSchedule({ ...editedSchedule, startTime: slot?.startTime, endTime: slot?.endTime });
                    }}
                  >
                    <option value="">Select Time</option>
                    {availableSlots.map(slot => (
                      <option key={slot.startTime} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="schdEviny-detail-row">
                  <Notebook className="schdEviny-icon" />
                  <span className="schdEviny-label">Notes:</span>
                  <input
                    type="text"
                    value={editedSchedule.notes || ""}
                    onChange={(e) => setEditedSchedule({ ...editedSchedule, notes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={`schdEviny-status-badge ${schedule.status?.toLowerCase()}`}>
              {schedule.status}
            </div>

            <div className="schdEviny-modal-footer">
              <button className="schdEviny-btn" onClick={onClose}>Cancel</button>
              <button
                className="schdEviny-btn"
                onClick={handleUpdate}
                disabled={schedule.status === "Accepted" || schedule.status === "Rejected" || !isChanged()}
                style={{
                  cursor: schedule.status === "Accepted" || schedule.status === "Rejected" || !isChanged() ? "not-allowed" : "pointer",
                  opacity: schedule.status === "Accepted" || schedule.status === "Rejected" || !isChanged() ? 0.5 : 1
                }}
              >
                Update
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ScheduleDetailsModal;
