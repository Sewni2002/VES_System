// src/pages/GroupsList.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/licApi";
import axios from "axios";
import "./LICGroups_View.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function GroupsList() {
  const navigate = useNavigate();
  const query = useQuery();

  // --- Header + session ---
  const licID = localStorage.getItem("licID");
  const [lic, setLic] = useState(null);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Load signed-in LIC profile
  useEffect(() => {
    if (licID) {
      axios
        .get(`http://localhost:5000/api/licprofilemanage/${licID}`)
        .then((res) => setLic(res.data))
        .catch((err) => console.error(err));
    }
  }, [licID]);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const [year, setYear] = useState(query.get("year") || "");
  const [semester, setSemester] = useState(query.get("semester") || "");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadGroups = async () => {
    try {
      setLoading(true);
      setErr("");
      const params = {};
      if (year) params.year = year;
      if (semester) params.semester = semester;

      const res = await api.get("/groups", { params });
      const data = Array.isArray(res.data)
        ? { items: res.data, total: res.data.length }
        : res.data;

      setItems(data.items || []);
      setTotal(data.total ?? (data.items || []).length);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (year) params.set("year", year);
    if (semester) params.set("semester", semester);
    navigate(`/groups/list${params.toString() ? `?${params}` : ""}`);
    loadGroups();
  };

  const resetFilters = () => {
    setYear("");
    setSemester("");
    navigate("/groups/list");
    loadGroups();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete group ${row.groupId}?`)) return;
    try {
      await api.delete(`/groups/${row._id}`);
      await loadGroups();
      alert("Group deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return String(iso).slice(0, 10);
    }
  };

  
  return (
      <>
         <NavLIC/>
      

      {/* Page layout */}
      <div className="wrap">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile">
            <div className="avatar">
                      <img src={qImage} alt="profile" />
              
            </div>
            <div className="name">{lic?.name || "LIC Officer"}</div>
          </div>
          <div className="menu">
            <Link to="/licdash" className="menuItem">Dashboard</Link>
           <Link to="/groupsLIC" className="menuItem">Groups</Link>
           <Link to="/deadlines" className="menuItem">Evaluations & Deadlines</Link>
           <Link to="/topics" className="menuItem">Topic Management</Link>
           <Link to="/scheduler" className="menuItem">Scheduler</Link>
           <Link to="/reports" className="menuItem">Reports</Link>
           {/*<Link to="/group-changes" className="menuItem">Change Requests</Link>*/}
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="pageHeader">
            <h1 className="title">Existing Groups</h1>
            <div className="headerActions">
              <Link to="/groupsLIC" className="btn ghost">+ Generate New</Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="filters">
              <div className="grid3">
                <div className="row">
                  <label className="lbl">Year</label>
                  <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">All</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
                <div className="row">
                  <label className="lbl">Semester</label>
                  <select className="input" value={semester} onChange={(e) => setSemester(e.target.value)}>
                    <option value="">All</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
                <div className="row actionsRow">
                  <button className="btn" onClick={applyFilters}>Apply</button>
                  <button className="btn ghost" onClick={resetFilters}>Reset</button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card">
            <div className="tableHeader">
              <h3>Groups</h3>
              <span className="muted">{total} item(s)</span>
              <div className="headerButtons">
                <button className="miniBtn" onClick={loadGroups} disabled={loading}>Refresh</button>
              </div>
            </div>

            {loading ? (
              <div className="empty">Loading…</div>
            ) : err ? (
              <div className="error">{err}</div>
            ) : (
              <div className="table">
                <div className="tHead">
                  <span>Group ID</span>
                  <span>Name</span>
                  <span>Year</span>
                  <span>Semester</span>
                  <span>Module</span>
                  <span>Topic</span>
                  <span>Members</span>
                  <span>Assigned By</span>
                  <span>Assigned Date</span>
                  <span>Actions</span>
                </div>

                {items.length === 0 ? (
                  <div className="empty">No groups found. Try changing filters or generate new groups.</div>
                ) : (
                  items.map((g) => (
                    <div className="tRow" key={g._id}>
                      <span>{g.groupId || "—"}</span>
                      <span>{g.groupName || "—"}</span>
                      <span>{g.year ?? "—"}</span>
                      <span>{g.semester ?? "—"}</span>
                      <span>{g.moduleCode || "—"}</span>
                      <span>{g.topicId ? `${g.topicId} — ${g.topicName}` : "—"}</span>
                      <span>{g.membersCount ?? (g.members ? g.members.length : 0)}</span>
                      <span>{g.assignedBy || "—"}</span>
                      <span>{fmtDate(g.assignedDate)}</span>
                      <span className="rowActions">
                        <button className="miniBtn danger" onClick={() => handleDelete(g)}>Delete</button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
