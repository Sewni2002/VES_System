import React, { useState } from 'react';
import TodaySessions from './TodaySessions';
import AttendanceForm from './AttendanceForm';
import Notifications from './Notifications';
import CalendarView from './CalendarView';
import UnavailabilityForm from './UnavailabilityForm';
import NotesForm from './NotesForm';
import SubstituteForm from './SubstituteForm';
import WeatherWidget from './WeatherWidget';
import API from '../../api'; 
import './insDashboard.css'; 
import INTNav from '../nav/INTnav';

function InsDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError("⚠️ Please enter a valid Instructor ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await API.get(`/api/scheduler/today?instructorId=${searchId}`);
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch schedules. Please check Instructor ID.");
      setSchedules([]);
    }

    setLoading(false);
  };

  return (
     <>
          <INTNav />
    
    <div className="id-dashboard-container">
      <h1 className="id-dashboard-title">Instructor Viva Task Manager Dashboard</h1>

      {/* Top Section: Search Bar */}
      <div className="id-search-container">
        <input
          type="text"
          placeholder="Enter Instructor ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="id-search-input"
        />
        <button onClick={handleSearch} className="id-search-button">Search</button>
      </div>

      {/* Schedule Table */}
      {loading && <p className="id-loading-text">Loading schedules...</p>}
      {error && <p className="id-error-text">{error}</p>}
      {schedules.length > 0 && (
        <div className="id-schedule-table-container">
          <table className="id-schedule-table">
            <thead>
              <tr>
                <th>Group ID</th>
                <th>Topic</th>
                <th>Members</th>
                <th>Date & Time</th>
                <th>Hall</th>
                <th>Notes</th>
                <th>Substitute</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((sched) => (
                <tr key={sched._id}>
                  <td>{sched.groupId}</td>
                  <td>{sched.groupTopic}</td>
                  <td>{sched.groupMembers.join(', ')}</td>
                  <td>{new Date(sched.scheduledDateTime).toLocaleString()}</td>
                  <td>{sched.hallNumber}</td>
                  <td>{sched.notes || '-'}</td>
                  <td>{sched.substituteInstructor || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Middle Section: Calendar + Weather */}
      <div className="id-middle-section">
        <div className="id-calendar-box">
          <CalendarView />
        </div>
        <div className="id-right-panel">
          <div className="id-weather-box">
            <WeatherWidget city="Colombo" />
          </div>
          <div className="id-today-sessions">
            <TodaySessions />
          </div>
        </div>
      </div>

      {/* Bottom Forms Section */}
      <div className="id-forms-grid">
        <SubstituteForm />
        <UnavailabilityForm />
        <NotesForm />
      </div>

      <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
    </>
  );
}

export default InsDashboard;
