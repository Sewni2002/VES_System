import React, { useEffect, useState } from "react";
import "./DeanDashboard.css";
import Nav from "../nav/deanNav"; // already correct in your snippet

import {
  Calendar,
  Clock,
  User,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  BookOpen,
  Hash
} from "lucide-react";

function DeanDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Pending"); 
  const [confirmModal, setConfirmModal] = useState({ show: false, schedId: "", action: "" });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/groups/getAllgroups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/schedulerVD");
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setError("");
      const res = await fetch(
        `http://localhost:5000/api/schedulerVD/status/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      await res.json();
      fetchSchedules();
    } catch (err) {
      console.error(err);
      setError("Failed to update status");
    } finally {
      setConfirmModal({ show: false, schedId: "", action: "" });
    }
  };

  const filteredSchedules = schedules.filter(
    (sched) => sched.status === activeTab
  );

  return (
    
  <>
    <Nav /> 
    
    <div className="dean-dashboard">
     

      {/* Tabs */}
      <div className="tabs">
        {["Pending", "Accepted", "Rejected"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading/Error/Empty */}
      {loading && <p>Loading schedules...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && filteredSchedules.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No {activeTab} schedules found.
        </p>
      )}

      {/* Schedule List */}
      {!loading &&
        filteredSchedules.length > 0 &&
        filteredSchedules.map((sched) => (
          <div key={sched._id} className="schedule-card">
            <h3>
              <BookOpen className="icon-sm" /> {sched.groupTopic}
            </h3>
            <p>
              <Hash className="icon-sm" /> Session Id: {sched.sessionId}
            </p>
            <p>
              <Users className="icon-sm" /> Group: {groups.find(g => g._id === sched.groupId)?.groupName || sched.groupId}
            </p>
            <p>
              <User className="icon-sm" /> Instructor: {sched.instructorId}
            </p>
            <p>
              <MapPin className="icon-sm" /> Hall: {sched.hallNumber}
            </p>
            <p>
              <Calendar className="icon-sm" /> Date: {sched.scheduledDateTime.split("T")[0]}
            </p>
            <p>
              <Clock className="icon-sm" /> Time: {sched.startTime} - {sched.endTime}
            </p>
            <p>
              <Users className="icon-sm" /> Members: {sched.groupMembers.join(", ")}
            </p>

            <p className={`status ${sched.status.toLowerCase()}`}>
              {sched.status === "Accepted" && (
                <>
                  <CheckCircle className="icon-sm" /> Accepted
                </>
              )}
              {sched.status === "Rejected" && (
                <>
                  <XCircle className="icon-sm" /> Rejected
                </>
              )}
              {sched.status === "Pending" && (
                <>
                  <Clock className="icon-sm" /> Pending
                </>
              )}
            </p>

            <div className="button-group">
              <button
                className="btn btn-approve"
                disabled={sched.status !== "Pending"}
                onClick={() => setConfirmModal({ show: true, schedId: sched._id, action: "Accepted" })}
              >
                <CheckCircle className="icon-btn" /> Approve
              </button>
              <button
                className="btn btn-reject"
                disabled={sched.status !== "Pending"}
                onClick={() => setConfirmModal({ show: true, schedId: sched._id, action: "Rejected" })}
              >
                <XCircle className="icon-btn" /> Reject
              </button>
            </div>
          </div>
        ))}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              Are you sure you want to {confirmModal.action.toLowerCase()} this schedule?
            </h3>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmModal({ show: false, schedId: "", action: "" })}
              >
                No
              </button>
              <button
                className="btn btn-approve"
                onClick={() => handleStatusChange(confirmModal.schedId, confirmModal.action)}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
       <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>

    </>
  );
}

export default DeanDashboard;
