import React, { useEffect, useState } from 'react';
import './TodayGroups.css'; 
import INTNav from '../nav/INTnav';
import { useNavigate } from 'react-router-dom';
import API from '../../api';

function TodayGroups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateString, setDateString] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const instructorID = localStorage.getItem("instructorID");

        if (!instructorID) {
          setError("Instructor ID not found in localStorage");
          setLoading(false);
          return;
        }

        const res = await API.get(`/api/scheduler/today?instructorId=${instructorID}`);
        console.log("Fetched groups:", res.data);
        setGroups(res.data);
        setLoading(false);

        if (res.data.length > 0) {
          const today = new Date();
          const options = { year: 'numeric', month: 'long', day: 'numeric' };
          setDateString(today.toLocaleDateString('en-US', options));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) return <p>Loading groups...</p>;
  if (error) return <p>Error loading groups: {error}</p>;

  return (
    <>
      <INTNav />

      {/* Top Image Section */}
      <div className="tg-header">
        <img
          src="/eval.jpeg"
          alt="Evaluation"
          className="tg-header-image"
        />
      </div>
      
      <div className="tg-page">
        <div className="tg-container">
          <h1 className="tg-title">Groups Assigned Today</h1>
          <p className="tg-date">Date: {dateString}</p>

          {groups.length === 0 ? (
            <p>No groups found for today.</p>
          ) : (
            <div className="tg-group-list">
              {groups.map((group) => (
                <div
                  key={group._id}
                  className="tg-group-card"
                  onClick={() => navigate(`/group/${group.groupId || group._id}`)}
                >
                  <h3>Group ID: {group.groupId || group._id}</h3>
                  <p>Topic: {group.groupTopic}</p>
                  <p>Hall: {group.hallNumber}</p>
                  <p>Members: {group.groupMembers.join(", ")}</p>
                </div>
              ))}
            </div>
          )}

          {selectedGroup && (
            <div className="tg-member-section">
              <h2>{selectedGroup.groupName} - Members</h2>
              <div className="tg-member-list">
                {selectedGroup.members.map((member, index) => (
                  <div key={index} className="tg-member-card">
                    {member}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
         <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
      </div>
    </>
  );
}

export default TodayGroups;
