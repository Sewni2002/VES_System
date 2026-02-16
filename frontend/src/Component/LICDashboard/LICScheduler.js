import React from "react";
import { Link } from "react-router-dom";
import "./LICScheduler.css";

export default function Instructors() {
  return (
    <div className="wrap">
      {/* LEFT: fixed sidebar */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar"></div>
          <div className="name">LIC Officer</div>
        </div>

        <div className="menu">
          <Link to="/" className="menuItem">Dashboard</Link>
                    <Link to="/groups" className="menuItem">Groups</Link>
                    <Link to="/deadlines" className="menuItem">Deadlines & Instructions</Link>
                    <Link to="/topics" className="menuItem">Topic Management</Link>
                    <Link to="/scheduler" className="menuItem">Scheduler</Link>
                    <Link to="/approval" className="menuItem">LIC Approval</Link>
                    <Link to="/reports" className="menuItem">Reports</Link>
                    <Link to="/group-changes" className="menuItem">Group Change Request</Link>
        </div>
      </div>

      {/* RIGHT: page content */}
      <div className="main">
        <h1 className="title">Schduler</h1>
        <div className="blank">
          <p className="blankText">Assign/view instructors here later.</p>
        </div>
      </div>
    </div>
  );
}

{/* <button className="lic-btn" onClick={() => setShowModal(true)}>
                  New Schedule
                </button> */}
