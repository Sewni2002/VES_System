import React, { useState, useEffect } from 'react';
import Nav from '../nav/nav';
import { FaRobot, FaCalendarAlt, FaCommentDots, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo from '../../assests/logo.png';
import slide1 from '../../assests/slide1.jpg';
import slide2 from '../../assests/slide2.jpg';
import slide3 from '../../assests/slide3.jpg';

function Home() {
  const navigate = useNavigate();
  const slides = [slide1, slide2, slide3];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Navigation */}
      <Nav />

      {/* Hero Section */}
     {/* Hero Section */}
<section className="hero" style={{ backgroundImage: `url(${slides[currentSlide]})` }}>
  <div className="hero-overlay" />
  <div className="hero-text left-align">
    <h1>Viva Evaluation System</h1>
    <h2 className="slogan">Innovating Academic Evaluations</h2>
    <p className="description">
      The VES platform streamlines viva evaluations, enhances student engagement, 
      and provides educators with powerful tools for scheduling, feedback, and analytics.
    </p>
    <div className="button-group">
      <button
  onClick={() => navigate('/login')}
  style={{
    backgroundColor: "white",
    color: "black",
    fontWeight: "bold",
    border: "2px solid black",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    marginRight: "10px",
    transition: "all 0.3s ease",
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = "#317902ff";
    e.target.style.color = "#fff";
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = "white";
    e.target.style.color = "black";
  }}
>
  Sign In
</button>

<button
  onClick={() => navigate('/instructor-register')}
  style={{
    backgroundColor: "white",
    color: "black",
    fontWeight: "bold",
    border: "2px solid black",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  }}
  onMouseOver={(e) => {
    e.target.style.backgroundColor = "#317902ff";
    e.target.style.color = "#fff";
  }}
  onMouseOut={(e) => {
    e.target.style.backgroundColor = "white";
    e.target.style.color = "black";
  }}
>
  Instructor Register
</button>

    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="card-section">
        <div className="card-btn" >
          <FaRobot className="card-icon" />
          <h3>Automated Evaluation</h3>
          <p>AI-assisted evaluation ensures fair and consistent viva assessments.</p>
        </div>
        <div className="card-btn">
          <FaCalendarAlt className="card-icon" />
          <h3>Live Viva Scheduling</h3>
          <p>Schedule viva sessions seamlessly with real-time coordination.</p>
        </div>
        <div className="card-btn">
          <FaCommentDots className="card-icon" />
          <h3>Student Feedback</h3>
          <p>Gather and analyze student feedback to improve quality.</p>
        </div>
        <div className="card-btn">
          <FaChartBar className="card-icon" />
          <h3>Analytics & Reports</h3>
          <p>Access detailed reports and insights for continuous improvement.</p>
        </div>
      </section>
        <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </div>
    
  );
}

export default Home;
