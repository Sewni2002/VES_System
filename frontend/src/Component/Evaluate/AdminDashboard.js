import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, ScatterChart, Scatter,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell
} from 'recharts';
import './AdminDashboard.css';
import INTNav from '../nav/INTnav';


function AdminDashboard() {



  
  // Sample data
  const lineData = [
  { name: 'Jan', value: 40 },
  { name: 'Feb', value: 60 },
  { name: 'Mar', value: 80 },
  { name: 'Apr', value: 75 },
  { name: 'May', value: 90 },
  { name: 'Jun', value: 100 },
];

const barData = [
  { name: 'Group A', value: 30 },
  { name: 'Group B', value: 70 },
  { name: 'Group C', value: 50 },
  { name: 'Group D', value: 20 },
  { name: 'Group E', value: 60 },
];

const pieData = [
  { name: 'Pass', value: 65 },
  { name: 'Fail', value: 20 },
  { name: 'Pending', value: 15 },
];

const scatterData = [
  { x: 10, y: 60 },
  { x: 20, y: 80 },
  { x: 30, y: 55 },
  { x: 40, y: 90 },
  { x: 50, y: 65 },
  { x: 60, y: 70 },
];

const boxData = [
  { name: 'Q1', value: 55 },
  { name: 'Q2', value: 75 },
  { name: 'Q3', value: 60 },
  { name: 'Q4', value: 85 },
];

  
  const COLORS = ['#198754', '#dc3545'];

  return (
     <>
      <INTNav />
<div className="admin-container">
    <aside className="sidebar">
      <h2 className="sidebar-title">VES Admin</h2>
      <nav className="sidebar-nav">
        <a href="#">Dashboard</a>
        <a href="#">Evaluations</a>
        <a href="#">Schedule</a>
        <a href="#">Reports</a>
        <a href="#">Logout</a>
      </nav>
    </aside>
    

     <main className="dashboard-content">
    <div className="dashboard-grid">
      {/* 1: Summary + Line */}
      <div className="summary-card">
        <h3>Total Evaluations</h3>
        <p>Last 3 months performance</p>
        <ul>
          <li>Completed: 120</li>
          <li>Avg Duration: 22 mins</li>
        </ul>
      </div>
      <div className="chart-card">
        <LineChart width={300} height={200} data={lineData}>
          <XAxis dataKey="name" /><YAxis /><CartesianGrid strokeDasharray="3 3" />
          <Tooltip /><Legend />
          <Line type="monotone" dataKey="value" stroke="#0d6efd" />
        </LineChart>
      </div>

      {/* 2: Summary + Bar */}
      <div className="summary-card">
        <h3>Schedule Stats</h3>
        <p>Sessions per Category</p>
        <ul>
          <li>Group A: 30</li>
          <li>Group B: 70</li>
        </ul>
      </div>
      <div className="chart-card">
        <BarChart width={300} height={200} data={barData}>
          <XAxis dataKey="name" /><YAxis /><CartesianGrid strokeDasharray="3 3" />
          <Tooltip /><Bar dataKey="value" fill="#0dcaf0" />
        </BarChart>
      </div>

      {/* 3: Summary + Pie */}
      <div className="summary-card">
        <h3>Pass/Fail Ratio</h3>
        <p>This Semester</p>
        <ul>
          <li>Pass: 70%</li>
          <li>Fail: 30%</li>
        </ul>
      </div>
      <div className="chart-card">
        <PieChart width={300} height={200}>
          <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
            {pieData.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* 4: Summary + Scatter */}
      <div className="summary-card">
        <h3>Score Distribution</h3>
        <p>Evaluation Scores</p>
        <ul>
          <li>Max: 98%</li>
          <li>Min: 40%</li>
        </ul>
      </div>
      <div className="chart-card">
        <ScatterChart width={300} height={200}>
          <XAxis dataKey="x" /><YAxis dataKey="y" />
          <CartesianGrid /><Tooltip />
          <Scatter data={scatterData} fill="#6610f2" />
        </ScatterChart>
      </div>

      {/* 5: Summary + Box/Bar */}
      <div className="summary-card">
        <h3>Quarterly Metrics</h3>
        <p>Evaluator Trends</p>
        <ul>
          <li>Best: Q2</li>
          <li>Outlier: Q1</li>
        </ul>
      </div>
      <div className="chart-card">
        <BarChart width={300} height={200} data={boxData}>
          <XAxis dataKey="name" /><YAxis /><CartesianGrid strokeDasharray="3 3" />
          <Tooltip /><Bar dataKey="value" fill="#fd7e14" />
        </BarChart>
      </div>
    </div>
    </main>
    </div>
    </>
  );
}

export default AdminDashboard;
