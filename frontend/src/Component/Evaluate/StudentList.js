import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import './stulist.css';
import API from '../../api';
import INTNav from '../nav/INTnav';

function StudentList() {
  const { gid } = useParams(); // group ID from URL
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // 1Fetch the group by gid
        const groupRes = await API.get(`/api/groups/by-gid/${gid}`);
        console.log("Fetched group data:", groupRes.data);

        // Handle whether API returns array or single object
        const groupData = Array.isArray(groupRes.data) ? groupRes.data[0] : groupRes.data;

        if (!groupData || !groupData.members || groupData.members.length === 0) {
          console.log("No members found in this group.");
          setStudents([]);
          setLoading(false);
          return;
        }

        const studentIDs = groupData.members;
        console.log("Student IDs to fetch:", studentIDs);

        // 2Fetch students by IDs
        const studentsRes = await API.post('/api/students/by-ids', { ids: studentIDs });
        console.log("Fetched student data:", studentsRes.data);

        // Map student objects to have a 'name' property for rendering
        const studentsWithName = studentsRes.data.map(student => ({
          ...student,
          name: student.name || `${student.fname || ''} ${student.lname || ''}`.trim(),
          topic: student.topic || "N/A"
        }));

        setStudents(studentsWithName);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (gid) fetchStudents();
  }, [gid]);


   

  if (loading) return <p className="loading-text">Loading students...</p>;
  if (error) return <p className="error-text">Error: {error}</p>;

  if (students.length === 0) return <p className="loading-text">No students found in this group.</p>;

  return (
     <>
          <INTNav />
    <div className="group-container">
      <h1 className="group-heading">Students in Group {gid}</h1>
      <div className="member-section">
        <div className="member-list">
          {students.map(student => (
            <div key={student.idNumber} className="member-card">
              <p className="member-name"><strong>{student.name}</strong></p>
              <p className="member-id">ID: {student.idNumber}</p>
              <p className="member-topic">Topic: {student.topic}</p>
              <button
                className="evaluate-btn"
                onClick={() => navigate(`/ManualEval/${student.idNumber}`)}
              >
                Evaluate Now
              </button>
            </div>
          ))}
        </div>
      </div>
       <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
    </>
  );
}

export default StudentList;
