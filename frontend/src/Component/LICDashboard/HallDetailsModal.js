import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import "./HallDetailsModal.css";

function HallDetailsModal({ show, onClose }) {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHall, setNewHall] = useState({
    hallNumber: ""
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  const fetchHalls = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('Fetching halls...');
      const res = await fetch(`${API_BASE_URL}/halls`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      console.log('Fetch response:', { 
        status: res.status, 
        statusText: res.statusText,
        ok: res.ok 
      });
      
      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Fetched halls data:', data);
      
      if (data && Array.isArray(data.halls)) {
        setHalls(data.halls);
        console.log('Updated halls state with:', data.halls.length, 'halls');
      } else {
        console.warn('Unexpected response format:', data);
        setHalls([]);
      }
      setError("");
    } catch (err) {
      console.error('Error fetching halls:', err);
      setError(err.message || "Failed to load halls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    fetchHalls();
  }, [show]);

  const handleAddHall = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/halls/add`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify({
          hallNumber: newHall.hallNumber
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add hall");
      }

      setSuccess(data.message);
      setNewHall({ hallNumber: "" });
      setShowAddForm(false);
      await fetchHalls();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to add hall");
    }
  };

  const handleToggleHallStatus = async (hallNumber, currentStatus) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const newStatus = !currentStatus;
      console.log(`Attempting to ${newStatus ? 'enable' : 'disable'} hall ${hallNumber}`);
      
      const res = await fetch(`${API_BASE_URL}/halls/${hallNumber}/status`, {
        method: "PATCH",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        mode: 'cors',
        body: JSON.stringify({
          isActive: newStatus
        })
      }).catch(err => {
        console.error('Network error:', err);
        throw new Error('Network error: Could not connect to server');
      });

      console.log('Server response status:', res.status);
      
      const data = await res.json().catch(err => {
        console.error('Parse error:', err);
        throw new Error('Could not parse server response');
      });
      
      console.log('Server response data:', data);

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }

      if (data.success) {
        console.log('Update successful, refreshing halls');
        await fetchHalls();
        setSuccess(data.message || `Hall ${hallNumber} ${newStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error('Error updating hall status:', err);
      setError(err.message || "Failed to update hall status");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="hall-modal-backdrop" onClick={onClose}>
      <div className="hall-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="hall-modal-header">
          <h2>All Halls</h2>
          <button className="hall-close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="hall-actions">
          <button className="hall-add-btn" onClick={() => setShowAddForm(true)}>
            <Plus className="icon-sm" /> Add New Hall
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddHall} className="hall-add-form">
            <div className="form-group">
              <label>Hall Number:</label>
              <input
                type="text"
                required
                value={newHall.hallNumber}
                onChange={(e) => setNewHall({ ...newHall, hallNumber: e.target.value })}
                placeholder="Enter hall number"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn">Add Hall</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        )}

        {loading && <p className="hall-loading">Loading halls...</p>}
        {error && <p className="hall-error">{error}</p>}
        {success && <p className="hall-success">{success}</p>}
        {!loading && halls.length === 0 && <p>No halls available</p>}

        <div className="hall-list">
          {halls.map((hall) => {
            const today = new Date().setHours(0, 0, 0, 0);
            const futureSlots = (hall.slots || [])
              .filter(slot => new Date(slot.date).setHours(0, 0, 0, 0) >= today)
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            return (
              <div key={hall._id} className="hall-card">
                <div className="hall-card-header">
                  <div className="hall-title-section">
                    <h3>Hall: {hall.hallNumber}</h3>
                    <div className="hall-status-controls">
                      <span className={`hall-status-badge ${hall.isActive ? 'active' : 'inactive'}`}>
                        {hall.isActive ? 'Available' : 'Unavailable'}
                      </span>
                      <button 
                        className={`hall-toggle-btn ${hall.isActive ? 'deactivate' : 'activate'} ${loading ? 'loading' : ''}`}
                        onClick={() => handleToggleHallStatus(hall.hallNumber, hall.isActive)}
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : `${hall.isActive ? 'Disable' : 'Enable'} Hall`}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="hall-info">
                  <p className="hall-status-note">
                    {hall.isActive 
                      ? 'This hall is available for scheduling' 
                      : 'This hall is currently disabled'}
                  </p>
                </div>
                {futureSlots.length === 0 ? (
                  <p>No upcoming slots available</p>
                ) : (
                  <table className="hall-slots-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {futureSlots.map((slot) => {
                        const slotDate = new Date(slot.date);
                        const now = new Date();
                        const isPast = slotDate < new Date(now.setHours(0, 0, 0, 0));
                        const status = slot.booked || isPast ? "Allocated" : "Available";

                        return (
                          <tr key={slot._id}>
                            <td>{slotDate.toISOString().split("T")[0]}</td>
                            <td>{slot.startTime} - {slot.endTime}</td>
                            <td>{status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HallDetailsModal;
