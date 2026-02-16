import React from 'react';
import './nav.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../assests/logoblack.png'; // adjust path if needed

function Nav() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="VES Logo" />
      </div>
      <ul>
        <li onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>Dashboard</li>
        <li onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>Courses</li>
        <li onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>Assignments</li>
        <li onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>Grades</li>
        <li onClick={handleNavigateToLogin} style={{ cursor: 'pointer' }}>Profile</li>
      </ul>
    </nav>
  );
}

export default Nav;
