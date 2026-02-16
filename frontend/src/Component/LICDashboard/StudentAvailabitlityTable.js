import React, { useState, useEffect } from 'react';
import './StudentAvailability.css';

const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
  '16:00-17:00', '17:00-18:00'
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function StudentAvailabilityTable() {
  const [students, setStudents] = useState([]);
  const [weekStart, setWeekStart] = useState(getMonday(new Date()));
  const [selectedStudent, setSelectedStudent] = useState('');
  const [availability, setAvailability] = useState({});

  // Initialize availability grid
  useEffect(() => {
    const initialAvailability = {};
    days.forEach(day => {
      initialAvailability[day] = {};
      timeSlots.forEach(slot => {
        initialAvailability[day][slot] = true; // true = available, false = busy
      });
    });
    setAvailability(initialAvailability);
  }, []);

  // Fetch students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

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
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    try {
      const student = students.find(s => s._id === selectedStudent);
      const availabilityData = Object.entries(availability).map(([day, slots]) => ({
        day,
        timeSlots: Object.entries(slots).map(([slot, isAvailable]) => {
          const [startTime, endTime] = slot.split('-');
          return { startTime, endTime, isAvailable };
        })
      }));

      const res = await fetch('http://localhost:5000/api/student-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.studentId,
          studentName: student.name,
          weekStartDate: weekStart,
          availability: availabilityData
        })
      });

      if (res.ok) {
        alert('Availability saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save availability', err);
    }
  };

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  return (
    <div className="availability-container">
      <h2>Student Availability</h2>
      
      <div className="availability-controls">
        <select 
          value={selectedStudent} 
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          <option value="">Select Student</option>
          {students.map(student => (
            <option key={student._id} value={student._id}>
              {student.name} ({student.studentId})
            </option>
          ))}
        </select>

        <input
          type="date"
          value={weekStart}
          onChange={(e) => setWeekStart(e.target.value)}
        />

        <button onClick={saveAvailability} className="save-btn">
          Save Availability
        </button>
      </div>

      <div className="availability-table">
        <table>
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
    </div>
  );
}

export default StudentAvailabilityTable;