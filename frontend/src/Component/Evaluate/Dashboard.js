import React from 'react';
import { FaCheckCircle, FaChartBar, FaHeadset } from 'react-icons/fa';
import './Dashboard.css';
import INNav from '../nav/INTnav';
import { useNavigate } from 'react-router-dom';

const ChCard = ({ icon, title, description, onClick }) => (
  <div className="ch-card" onClick={onClick}>
    <div className="ch-card-icon">{icon}</div>
    <div className="ch-card-title">{title}</div>
    <ul className="ch-card-desc">
      {description.map((point, index) => (
        <li key={index}>{point}</li>
      ))}
    </ul>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <>
      <INNav />
      <div className="ch-dashboard">
        <div className="ch-card-container">
          <ChCard
            title="Evaluate"
            icon={<FaCheckCircle size={48} color="#00ff99" />}
            onClick={() => navigate('/groups')}
            description={[
             'View today’s viva groups',
'Mark evaluations and give feedback',
'Access student submissions easily',
'Track student progress during viva sessions',
'Approve or remote sessions'
            ]}
          />
          <ChCard
            title="Generate Reports"
            icon={<FaChartBar size={48} color="#00ccff" />}
            onClick={() => navigate('/viva-dashboard')}
            description={[
              'Generate detailed viva reports',
'View performance summaries',
'Export evaluation data',
'Filter reports by batch, instructor, or date',
'Visualize insights through charts and statistics',

            ]}
          />
          <ChCard
            title="Support"
            icon={<FaHeadset size={48} color="#ff66cc" />}
            onClick={() => navigate('/insDashboard')}
            description={[
             'Assign substitute instructors for sessions',
              'Mark instructor unavailability with date range',
              'Add or update session notes for groups',
              'Send email or SMS reminders to students',
              'Check weather and campus updates',
            ]}
          />
        </div>
         <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
      </div>
    </>
  );
};

export default Dashboard;
