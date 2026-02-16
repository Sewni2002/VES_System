import React, { useState, useEffect } from "react";
import { Calendar, Users, User, Bell, Hash, Clock, Plus, Edit3, MapPin, X, Notebook, Edit, Trash, Eye, EyeOff } from "lucide-react";
import ReportButtonExcel from "./ReportButtonExcel";
import "./LICScheduling.css";
import CreateScheduleModal from "./CreateScheduleModal";
import ScheduleDetailsModal from "./ScheduleDetail";
import HallDetailsModal from "./HallDetailsModal";
import Nav from "../nav/licNav";

const initialFormData = {
  groupId: "",
  hallNumber: "",
  groupTopic: "",
  groupMembers: "",
  scheduledDateTime: "",
  sessionId: "",
  startTime: "",
  endTime: "",
  instructorId: "",
  notes: "",
};

// Time slots and days for availability table
const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function LICScheduling() {
  const licID = localStorage.getItem("licID");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [groups, setGroups] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showHallsModal, setShowHallsModal] = useState(false);
  
  // Group Availability States
  const [showAvailabilityTable, setShowAvailabilityTable] = useState(false);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [selectedGroup, setSelectedGroup] = useState('');
  const [availability, setAvailability] = useState({});















  
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/schedulerVD");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        setError("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/groups/getAllgroups");
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("Failed to load groups", err);
      }
    };
    fetchGroups();
  }, []);

  // Load existing availability when group is selected
  useEffect(() => {
    if (selectedGroup && showAvailabilityTable) {
      loadGroupAvailability();
    }
  }, [selectedGroup, weekStart, showAvailabilityTable]);

  // Initialize availability grid
  useEffect(() => {
    if (showAvailabilityTable && !selectedGroup) {
      const initialAvailability = {};
      days.forEach(day => {
        initialAvailability[day] = {};
        timeSlots.forEach(slot => {
          initialAvailability[day][slot] = true;
        });
      });
      setAvailability(initialAvailability);
    }
  }, [showAvailabilityTable, selectedGroup]);

const loadGroupAvailability = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/student-availability/group/${selectedGroup}/week/${weekStart}`);
    if (res.ok) {
      const data = await res.json();
      
      // Use data.data.availability based on your backend response
      const availabilityArray = data.data?.availability || [];

      if (availabilityArray.length > 0) {
        const convertedAvailability = {};
        availabilityArray.forEach(dayAvailability => {
          convertedAvailability[dayAvailability.day] = {};
          dayAvailability.timeSlots.forEach(slot => {
            const slotKey = `${slot.startTime}-${slot.endTime}`;
            convertedAvailability[dayAvailability.day][slotKey] = slot.isAvailable;
          });
        });
        setAvailability(convertedAvailability);
      } else {
        // Initialize empty availability if none exists
        const initialAvailability = {};
        days.forEach(day => {
          initialAvailability[day] = {};
          timeSlots.forEach(slot => {
            initialAvailability[day][slot] = true;
          });
        });
        setAvailability(initialAvailability);
      }
    } else {
      // Initialize empty availability if API fails
      const initialAvailability = {};
      days.forEach(day => {
        initialAvailability[day] = {};
        timeSlots.forEach(slot => {
          initialAvailability[day][slot] = true;
        });
      });
      setAvailability(initialAvailability);
    }
  } catch (err) {
    console.error('Failed to load group availability', err);
    // Fallback to empty availability
    const initialAvailability = {};
    days.forEach(day => {
      initialAvailability[day] = {};
      timeSlots.forEach(slot => {
        initialAvailability[day][slot] = true;
      });
    });
    setAvailability(initialAvailability);
  }
};

  
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    
    // Check group availability before creating schedule
    const availabilityError = await checkGroupAvailability();
    if (availabilityError) {
      alert(availabilityError);
      return;
    }

    try {
      const submitData = {
        groupId: formData.groupId,
        groupTopic: formData.groupTopic,
        groupMembers: formData.groupMembers.split(',').map(member => member.trim()),
        scheduledDateTime: new Date(`${formData.scheduledDateTime}T${formData.startTime}`),
        instructorId: formData.instructorId,
        hallNumber: formData.hallNumber,
        notes: formData.notes,
        startTime: formData.startTime,
        endTime: formData.endTime,
        sessionId: formData.sessionId,
      };

      console.log("Submitting data:", submitData);

      const res = await fetch("http://localhost:5000/api/schedulerVD/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      
      const result = await res.json();
      console.log("Server response:", result);

      if (res.ok) {
        const todayRes = await fetch("http://localhost:5000/api/schedulerVD");
        const todaySchedules = await todayRes.json();
        setSchedules(todaySchedules);

        setShowModal(false);
        setFormData(initialFormData);
        alert("Schedule created successfully!");
      } else {
        alert(result.message || "Failed to create schedule");
      }
    } catch (err) {
      console.error("Failed to create schedule", err);
      alert("Network error: " + err.message);
    }
  };

  // Check if group is available at the scheduled time
const checkGroupAvailability = async () => {
  if (!formData.groupId || !formData.scheduledDateTime || !formData.startTime || !formData.endTime) {
    return null;
  }

  try {
    const scheduledDate = new Date(formData.scheduledDateTime);
    const dayName = scheduledDate.toLocaleDateString("en-US", { weekday: "long" });
    const monday = getMonday(scheduledDate);

    const res = await fetch(`http://localhost:5000/api/student-availability/group/${formData.groupId}/week/${monday}`);
    const response = await res.json();
    const availabilityData = response?.data?.availability;
    if (!availabilityData) return null;

    const dayAvailability = availabilityData.find(day => day.day === dayName);
    if (!dayAvailability) return null;

    // Convert times to minutes for easier comparison
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };
    const startMinutes = toMinutes(formData.startTime);
    const endMinutes = toMinutes(formData.endTime);

    // Check for overlap
    for (const slot of dayAvailability.timeSlots) {
      const slotStart = toMinutes(slot.startTime);
      const slotEnd = toMinutes(slot.endTime);
      
      const overlap = startMinutes < slotEnd && endMinutes > slotStart;
      if (overlap && !slot.isAvailable) {
        return `❌ Group ${formData.groupId} is NOT available on ${dayName} from ${formData.startTime} to ${formData.endTime}.`;
      }
    }

    return null; // All good
  } catch (err) {
    console.error("Error checking group availability:", err);
    return null;
  }
};


useEffect(() => {
  // Set default group and week if you want
  const defaultGroup = 'IT2030-Y2S2-001877';
  const defaultWeek = getMonday(new Date()); // e.g., '2025-10-13'

  setSelectedGroup(defaultGroup);
  setWeekStart(defaultWeek);
  setShowAvailabilityTable(true);
}, []);


  const toggleTimeSlot = (day, timeSlot) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeSlot]: !prev[day][timeSlot]
      }
    }));
  };

  const saveAvailability = async () => {
  if (!selectedGroup) {
    alert('Please select a group');
    return;
  }

  try {
    const group = groups.find(g => g.gid === selectedGroup);
    const availabilityData = Object.entries(availability).map(([day, slots]) => ({
      day,
      timeSlots: Object.entries(slots).map(([slot, isAvailable]) => {
        const [startTime, endTime] = slot.split('-');
        return { startTime, endTime, isAvailable };
      })
    }));

    console.log("🔄 Saving availability data:", {
      groupId: group.gid,
      groupName: group.groupName,
      weekStartDate: weekStart,
      availability: availabilityData
    });

    const res = await fetch('http://localhost:5000/api/student-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId: group.gid,
        groupName: group.groupName,
        weekStartDate: weekStart,
        availability: availabilityData
      })
    });

    const result = await res.json();
    console.log("📨 Save response:", result);

    if (res.ok) {
      alert('Group availability saved successfully!');
    } else {
      alert('Failed to save availability: ' + (result.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('❌ Failed to save availability', err);
    alert('Network error while saving availability');
  }
};

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/schedulerVD/delete/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s._id !== id));
      } else {
        alert(result.message || "Failed to delete schedule");
      }
    } catch (err) {
      console.error("Failed to delete schedule", err);
    }
  };

  const filteredSchedules = schedules.filter((sched) => {
    const searchMatch =
      (sched.groupTopic?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (sched.sessionId?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (sched.hallNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (sched.instructorId?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const statusMatch = statusFilter === "All" || sched.status === statusFilter;

    const dateMatch = selectedDate
      ? new Date(sched.scheduledDateTime).toISOString().split("T")[0] === selectedDate
      : true;

    return searchMatch && statusMatch && dateMatch;
  });

  return (
    <>
      <Nav/>
      <div className="lic-dashboard">
        <main className="lic-dashboard-content">
          {loading && <p className="lic-loading">Loading schedules...</p>}
          {error && <p className="lic-error">{error}</p>}

          {/* Group Availability Table Section */}
          {showAvailabilityTable && (
            <section className="availability-section">
              <div className="section-header">
                <h2>
                  <Eye className="lic-icon" />
                  Group Availability
                </h2>
                <button 
                  className="lic-btn secondary"
                  onClick={() => setShowAvailabilityTable(false)}
                >
                  <EyeOff size={16} />
                  Hide Availability
                </button>
              </div>

              <div className="availability-controls">
                <select 
                  value={selectedGroup} 
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="lic-search-select"
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.gid} value={group.gid}>
                      {group.groupName}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="lic-date-picker"
                />

                <button onClick={saveAvailability} className="lic-btn">
                  Save Availability
                </button>
              </div>

              <div className="availability-table-container">
                <table className="availability-table">
                  <thead>
                    <tr>
                      <th>Time/Day</th>
                      {days.map(day => (
                        <th key={day}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map(timeSlot => (
                      <tr key={timeSlot}>
                        <td className="time-slot">{timeSlot}</td>
                        {days.map(day => (
                          <td
                            key={`${day}-${timeSlot}`}
                            className={`availability-cell ${availability[day]?.[timeSlot] ? 'available' : 'busy'}`}
                            onClick={() => toggleTimeSlot(day, timeSlot)}
                          >
                            {availability[day]?.[timeSlot] ? '✓' : '✗'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="availability-legend">
                <div className="legend-item">
                  <div className="legend-color available"></div>
                  <span>Available (Click to mark busy)</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color busy"></div>
                  <span>Busy (Click to mark available)</span>
                </div>
              </div>
            </section>
          )}

          {/* Main Scheduler Section */}
          {!loading && schedules.length === 0 && !showAvailabilityTable && (
            <div className="lic-empty-state">
              <Calendar className="lic-icon-lg" />
              <h3>No schedules for today</h3>
              <p>Create your first schedule to get started</p>
              <button className="lic-btn" onClick={() => setShowModal(true)}>
                New Schedule
              </button>
            </div>
          )}

          {schedules.length > 0 && (
            <section>
              <div className="section-header">
                <h2 className="lic-section-title">
                  <Clock className="lic-icon" />
                  {selectedDate
                    ? `Schedules for ${new Date(selectedDate).toLocaleDateString()}`
                    : "All Schedules"}
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="lic-date-picker"
                  />
                </h2>
                
                <button 
                  className="lic-btn secondary"
                  onClick={() => setShowAvailabilityTable(!showAvailabilityTable)}
                > 
                  {showAvailabilityTable ? 'Hide Group Availability' : 'Show Group Availability'}
                </button>
              </div>

              <div className="lic-filters">
                <input
                  type="text"
                  placeholder="Search by Topic, Session ID, Hall, Instructor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="lic-search-field"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="lic-search-select"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="lic-actions">
                <button className="lic-btn" onClick={() => setShowHallsModal(true)}>
                  Halls
                </button>
                <button className="lic-btn" onClick={() => setShowModal(true)}>
                  New Schedule
                </button>
                <ReportButtonExcel schedules={filteredSchedules} />
              </div>

              <div className="lic-schedule-grid">
                {filteredSchedules.map((sched) => (
                  <div
                    key={sched._id}
                    className="lic-schedule-card"
                    onClick={() => setSelectedScheduleId(sched._id)}
                  >
                    <div className="lic-schedule-header">
                      <div className="lic-group-tag">
                        {groups.find(g => g.gid === sched.groupId)?.groupName || sched.groupId}
                      </div>
                      <div>
                        <h3>{sched.groupTopic}</h3>
                      </div>
                      <button
                        className="lic-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchedule(sched._id);
                        }}
                      >
                        <Trash />
                      </button>
                    </div>

                    <div className="lic-schedule-details">
                      <p><Hash className="lic-icon-sm" /> Session ID : {sched.sessionId}</p> 
                      <p><User className="lic-icon-sm" /> Instructor Name : {sched.instructorId}</p>
                      <p><Calendar className="lic-icon-sm" /> Date: {sched.scheduledDateTime.split("T")[0]}</p>
                      <p><Clock className="lic-icon-sm" /> Time Duration : {sched.startTime} - {sched.endTime}</p>
                      <p><MapPin className="lic-icon-sm" /> Hall No : {sched.hallNumber}</p>
                      <p><Users className="lic-icon-sm" /> Group Members : {sched.groupMembers.join(", ")}</p>
                      <p><Notebook className="lic-icon-sm" /> Notes: {sched.notes}</p>

                      <div className="lic-status-field">
                        {sched.status === 'Pending' && <span className="lic-status lic-pending">Pending</span>}
                        {sched.status === 'Accepted' && <span className="lic-status lic-accepted">Accepted</span>}
                        {sched.status === 'Rejected' && <span className="lic-status lic-rejected">Rejected</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="qg-footer">
                &copy; 2025 VES System. All rights reserved.
              </div>
            </section>
          )}
        </main>

        <CreateScheduleModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            setFormData({...initialFormData});
          }}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleCreateSchedule}
          groups={groups} 
        />

        <ScheduleDetailsModal
          show={!!selectedScheduleId}
          scheduleId={selectedScheduleId}
          onClose={() => setSelectedScheduleId(null)}
          onUpdate={async (updatedSchedule) => {
            try {
              const res = await fetch(`http://localhost:5000/api/schedulerVD/${updatedSchedule._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  scheduledDateTime: updatedSchedule.scheduledDateTime,
                  startTime: updatedSchedule.startTime,
                  hallNumber: updatedSchedule.hallNumber,
                  endTime: updatedSchedule.endTime,
                  groupTopic: updatedSchedule.groupTopic,
                  sessionId: updatedSchedule.sessionId,
                  notes: updatedSchedule.notes
                }),
              });
              const data = await res.json();

              setSchedules(prev => prev.map(s => s._id === data._id ? data : s));
              setSelectedScheduleId(null);
            } catch (err) {
              console.error("Failed to update schedule", err);
            }
          }}
        />

        <HallDetailsModal show={showHallsModal} onClose={() => setShowHallsModal(false)} />
      </div>
    </>
  );
}

export default LICScheduling;