import React, { useEffect, useState, useRef, useMemo } from "react";
import "./LICDashboard.css";

import { Link } from "react-router-dom";
import axios from "axios";
import NavLIC from "../nav/Licnavall";

import VivaDateForm from "../LICDashboard/VivaDateForm"; // adjust path if different
import AnnouncementForm from "../LICDashboard/AnnouncementForm"; // adjust path if different
import qImage from "../../assests/q.jpg";
import { api } from "../../api/licApi"; // your existing axios instance (baseURL: http://localhost:5000/api)
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";


function LICDashboard() {
  const licID = localStorage.getItem("licID");

  // Header/session/profile state
  const [lic, setLic] = useState(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

    const [stats, setStats] = useState({});
  
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);


  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);
const [downloadStudentID, setDownloadStudentID] = useState("");
const [downloadInfo, setDownloadInfo] = useState(null);
const [downloadError, setDownloadError] = useState("");


  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterModule, setFilterModule] = useState("");
const [showVivaOverlay, setShowVivaOverlay] = useState(false);
const [showAnnouncementOverlay, setShowAnnouncementOverlay] = useState(false);
const [groupStats, setGroupStats] = useState([]);
  //  Header/session 
  useEffect(() => {
    if (licID) {
      axios
        .get(`http://localhost:5000/api/licprofilemanage/${licID}`)
        .then((res) => {
          setLic(res.data);
          setFormData(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [licID]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);


 useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchData();
  }, []);



  useEffect(() => {
  const fetchGroupStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/licgroupsakindu/stats-recent");
      setGroupStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchGroupStats();
}, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  //  Profile image upload / save 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const fd = new FormData();
    fd.append("profileImage", file);
    axios
      .put(`http://localhost:5000/api/licprofilemanage/${licID}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => setLic(res.data))
      .catch((err) => console.error(err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .put(`http://localhost:5000/api/licprofilemanage/${licID}`, {
        name: formData.name,
        department: formData.department,
        contact: formData.contact,
      })
      .then((res) => {
        setLic(res.data);
        setShowOverlay(false);
      })
      .catch((err) => console.error(err));
  };

  // Load all dashboard data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [stu, mod, grp, top, dl, ins] = await Promise.all([
          api.get("/students").catch(() => ({ data: [] })),      
          api.get("/modules").catch(() => ({ data: [] })),
          api.get("/groups").catch(() => ({ data: [] })),
          api.get("/topics").catch(() => ({ data: [] })),
          api.get("/deadlines").catch(() => ({ data: [] })),
          api.get("/instructions").catch(() => ({ data: [] })),
        ]);
        setStudents(Array.isArray(stu.data) ? stu.data : stu.data?.items || []);
        setModules(Array.isArray(mod.data) ? mod.data : mod.data?.items || []);
        setGroups(Array.isArray(grp.data) ? grp.data : grp.data?.items || []);
        setTopics(Array.isArray(top.data) ? top.data : top.data?.items || []);
        setDeadlines(Array.isArray(dl.data) ? dl.data : dl.data?.items || []);
        setInstructions(Array.isArray(ins.data) ? ins.data : ins.data?.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helpers 
  const applyFilters = (arr, mappers = {}) => {
    // mappers can map differing field names
    const getYear = mappers.year || ((x) => x.year);
    const getSem = mappers.semester || ((x) => x.semester);
    const getMod = mappers.module || ((x) => x.moduleCode || x.moduleId);
    return arr.filter((x) => {
      if (filterYear && Number(getYear(x)) !== Number(filterYear)) return false;
      if (filterSemester && Number(getSem(x)) !== Number(filterSemester)) return false;
      if (filterModule && String(getMod(x)) !== String(filterModule)) return false;
      return true;
    });
  };

  const groupCount = (arr, keyFn) => {
    const map = new Map();
    arr.forEach((x) => {
      const k = keyFn(x);
      map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map, ([key, value]) => ({ key, value }));
  };

  const COLORS = ["#06b6d4", "#94a3b8", "#0ea5e9", "#22c55e", "#f59e0b", "#e11d48"];

  // Filtered datasets 
  const fStudents = useMemo(() => applyFilters(students), [students, filterYear, filterSemester, filterModule]);
  const fGroups = useMemo(() => applyFilters(groups), [groups, filterYear, filterSemester, filterModule]);
  const fTopics = useMemo(() => applyFilters(topics), [topics, filterYear, filterSemester, filterModule]);
  const fModules = useMemo(
    () =>
      applyFilters(modules, {
        year: (m) => m.academicYear ?? m.year,
        semester: (m) => m.semester,
        module: (m) => m.moduleId || m.moduleCode,
      }),
    [modules, filterYear, filterSemester, filterModule]
  );
  const fDeadlines = useMemo(() => applyFilters(deadlines), [deadlines, filterYear, filterSemester, filterModule]);
  const fInstructions = useMemo(() => applyFilters(instructions), [instructions, filterYear, filterSemester, filterModule]);

  //KPI counts 
  const totalStudents = fStudents.length;
  const totalGroups = fGroups.length;
  const totalTopics = fTopics.length;
  const totalDeadlines = fDeadlines.length;
  const totalInstructions = fInstructions.length;

  // Students Distribution (bar: by module) 
  const studentsByModule = useMemo(() => {
    const data = groupCount(fStudents, (s) => s.moduleCode || s.moduleId || "N/A")
      .sort((a, b) => b.value - a.value)
      .slice(0, 12) // top 12
      .map((x) => ({ label: x.key, value: x.value }));
    return data;
  }, [fStudents]);

  // ===== Modules Distribution (unused now but left intact) =====
  const modulesPies = useMemo(() => {
    const years = [1, 2, 3];
    return years.map((yr) => {
      const list = modules.filter((m) => Number(m.academicYear ?? m.year) === yr);
      const sem1 = list.filter((m) => Number(m.semester) === 1).length;
      const sem2 = list.filter((m) => Number(m.semester) === 2).length;
      return {
        year: yr,
        data: [
          { name: "Sem 1", value: sem1 },
          { name: "Sem 2", value: sem2 },
        ],
      };
    });
  }, [modules]);

  // ===== Groups Breakdown (pie by size buckets) =====
  const groupsBySize = useMemo(() => {
    const buckets = { small: 0, medium: 0, large: 0 };
    fGroups.forEach((g) => {
      const size = Array.isArray(g.members) ? g.members.length : Number(g.membersCount || 0);
      if (size <= 3) buckets.small += 1;
      else if (size <= 5) buckets.medium += 1;
      else buckets.large += 1;
    });
    return [
      { name: "2–3", value: buckets.small },
      { name: "4–5", value: buckets.medium },
      { name: "6+", value: buckets.large },
    ];
  }, [fGroups]);

  // ===== Upcoming Deadlines (next 7 days) =====
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 7);
    const toDate = (v) => (v ? new Date(v) : null);
    return fDeadlines
      .filter((d) => {
        const dEnd = toDate(d.endDate) || toDate(d.startDate);
        if (!dEnd) return false;
        return dEnd >= now && dEnd <= end;
      })
      .sort((a, b) => new Date(a.endDate || a.startDate) - new Date(b.endDate || b.startDate))
      .slice(0, 8);
  }, [fDeadlines]);

  // ===== Instructions tags overview (top tags) =====
  const instructionTagSummary = useMemo(() => {
    const map = new Map();
    fInstructions.forEach((i) => {
      (i.tags || []).forEach((t) => {
        const key = String(t).trim();
        if (!key) return;
        map.set(key, (map.get(key) || 0) + 1);
      });
    });
    return Array.from(map, ([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [fInstructions]);

  // ===== Module options from dataset =====
  const moduleOptions = useMemo(() => {
    const set = new Set(
      modules.map((m) => m.moduleId || m.moduleCode).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [modules]);

  return (
      <>
      <NavLIC/>
    <div className="wrap">
     
      {/* ===== Sidebar ===== */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar">
        <img src={qImage} alt="profile" />
            <label className="edit-icon">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </label>
          </div>
          <div className="name">{lic?.name || "Loading..."}</div>
        </div>

        <button className="editProfileBtn" onClick={() => setShowOverlay(true)}>
          Edit Profile
        </button>

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

      {/*Main*/}
      <div className="main" style={{ padding: "16px 24px" }}>
        {/* Filters */}
        {/* Filters */}
<div
  className="card"
  style={{
    marginBottom: 16,
    padding: "12px 16px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  <strong style={{ fontSize: 14, color: "#374151" }}>Filters:</strong>

  <select
    value={filterYear}
    onChange={(e) => setFilterYear(e.target.value)}
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "13px",
      backgroundColor: "#fff",
      color: "#111827",
      outline: "none",
      cursor: "pointer",
    }}
  >
    <option value="">All Years</option>
    <option value="1">Year 1</option>
    <option value="2">Year 2</option>
    <option value="3">Year 3</option>
    <option value="4">Year 4</option>
  </select>

  <select
    value={filterSemester}
    onChange={(e) => setFilterSemester(e.target.value)}
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "13px",
      backgroundColor: "#fff",
      color: "#111827",
      outline: "none",
      cursor: "pointer",
    }}
  >
    <option value="">All Semesters</option>
    <option value="1">Semester 1</option>
    <option value="2">Semester 2</option>
  </select>

  <select
    value={filterModule}
    onChange={(e) => setFilterModule(e.target.value)}
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "13px",
      backgroundColor: "#fff",
      color: "#111827",
      outline: "none",
      cursor: "pointer",
    }}
  >
    <option value="">All Modules</option>
    {moduleOptions.map((m) => (
      <option key={m} value={m}>
        {m}
      </option>
    ))}
  </select>

  <button
    className="miniBtn"
    onClick={() => {
      setFilterYear("");
      setFilterSemester("");
      setFilterModule("");
    }}
    style={{
      padding: "6px 12px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#000000ff",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 500,
      cursor: "pointer",
      transition: "0.2s",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#000000ff")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000000ff")}
  >
    Reset
  </button>
</div>


        {/* Top Row: KPI Cards */}
        <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
          <KpiCard title="Total Students" value={loading ? "…" : stats.totalStudents} />
          <KpiCard title="Total Groups" value={loading ? "…" : totalGroups} />
          <KpiCard title="Total Topics" value={loading ? "…" : totalTopics} />
          <KpiCard title="Deadlines" value={loading ? "…" : totalDeadlines} />
          <KpiCard title="Instructions" value={loading ? "…" : totalInstructions} />
        </div>


<div style={{ display: "flex", gap: 12, marginBottom: 16, marginLeft:29 }}>
 <button onClick={() => setShowVivaOverlay(true)} className="btn-viva-deadline">
  Set Viva Deadlines
</button>

<button onClick={() => setShowAnnouncementOverlay(true)} className="btn-announcement">
  Create Announcement
</button>

<button 
  onClick={() => {
    setDownloadStudentID("");
    setDownloadInfo(null);
    setDownloadError("");
    setShowDownloadOverlay(true);
  }} 
  className="btn-announcement"
>
  Download Student Zip
</button>


</div>

{/* Overlays */}
{showVivaOverlay && (
  <div className="overlay">
    <div className="overlayContent">
      <VivaDateForm />
<button onClick={() => setShowVivaOverlay(false)} className="licsDashboardBtnCls">
  Close
</button>
    </div>
  </div>
)}

{showAnnouncementOverlay && (
  <AnnouncementForm onClose={() => setShowAnnouncementOverlay(false)} />
)}


        <div className="card chart-card">
  <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between" }}>
    <h3>Students Assigned to Groups (Past 5 Days)</h3>
  </div>
  <div style={{ width: "100%", height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={groupStats} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="#f0f0f0" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="students" stroke="#0ea5e9" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>


        {/* Bottom Row: Insights */}
        <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Groups Breakdown */}
          <div className="card">
            <h3>Groups Breakdown (by size)</h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={groupsBySize} dataKey="value" nameKey="name" outerRadius={70}>
                    {groupsBySize.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Upcoming Deadlines (7 days)</h3>
              <Link to="/deadlines" className="miniBtn">View all</Link>
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="empty">No deadlines in the next week.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                {upcomingDeadlines.map((d) => {
                  const date = new Date(d.endDate || d.startDate).toLocaleDateString();
                  return (
                    <li key={d._id} className="listItem">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div>
                          <strong>{d.context || "Deadline"}</strong>
                          <div className="muted" style={{ fontSize: 12 }}>
                            {d.moduleCode || "—"}
                          </div>
                        </div>
                        <div className="muted">{date}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>




{showDownloadOverlay && (
  <div className="overlay">
    <div className="overlayContent">
      <h2 style={{fontSize:"1.5rem"}}>Download Student Zip</h2>
      <label>Enter Student ID:</label>
      <input style={{width:"95%"}}
        type="text"
        value={downloadStudentID}
        onChange={(e) => setDownloadStudentID(e.target.value)}
        placeholder="e.g. SID25597069"
      />
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="licsDashboardBtnCls"
          onClick={async () => {
            setDownloadError("");
            setDownloadInfo(null);
            try {
              const res = await axios.get(`http://localhost:5000/api/zip-submissionsakindu/${downloadStudentID}`);
              if (res.data) {
                setDownloadInfo(res.data);
              } else {
                setDownloadError("Student has not submitted the zip file.");
              }
            } catch (err) {
              setDownloadError("Student has not submitted the zip file.");
            }
          }}
        >
          Check & Download
        </button>
        <button className="licsDashboardBtnCls" onClick={() => setShowDownloadOverlay(false)}>Close</button>
      </div>

      {downloadInfo && (
        <div style={{ marginTop: 16 }}>
          <div>
            <strong>{downloadInfo.studentName}</strong> ({downloadInfo.studentID}) submitted:
            <br />
            {downloadInfo.zipFileOriginal || downloadInfo.zipFile}
          </div>
          <a
  href={`http://localhost:5000/uploads/zips/${downloadInfo.zipFile}`}
  download={downloadInfo.zipFileOriginal || downloadInfo.zipFile}
  style={{
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#0ea5e9",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    borderRadius: "6px",
    textDecoration: "none",
    textAlign: "center",
    transition: "background-color 0.2s",
    cursor: "pointer",
  }}
  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0284c7")}
  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0ea5e9")}
>
  Download Zip
</a>

        </div>
      )}

      {downloadError && <div style={{ marginTop: 12, color: "red" }}>{downloadError}</div>}
    </div>
  </div>
)}

          {/* Instructions Overview + Scheduler Quick Access */}
          <div className="card">
            <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Instructions Overview</h3>
              <Link to="/deadlines" className="miniBtn">Open</Link>
            </div>
            <div className="muted" style={{ marginBottom: 8 }}>
              Total Instructions: <strong>{totalInstructions}</strong>
            </div>
            {instructionTagSummary.length > 0 && (
              <div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                  Top tags:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {instructionTagSummary.map((t) => (
                    <span key={t.tag} className="badge">
                      {t.tag} · {t.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Scheduler</h4>
              <Link to="/scheduler" className="btn">
                Go to Scheduler →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Overlay for Profile Edit ===== */}
      {showOverlay && (
        <div className="overlay">
          <div className="overlayContent">
            <h2>Edit Profile</h2>
            <label>Name</label>
            <input type="text" name="name" value={formData.name || ""} onChange={handleChange} />

            <label>Department</label>
            <input type="text" name="department" value={formData.department || ""} onChange={handleChange} />

            <label>Contact</label>
            <input type="text" name="contact" value={formData.contact || ""} onChange={handleChange} />

            <div className="overlayActions">
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowOverlay(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
     </>
  );
}

/* --- Tiny presentational card for KPIs --- */
function KpiCard({ title, value }) {
  return (
    <div className="card kpi" style={{ padding: 16 }}>
      <div className="muted" style={{ fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default LICDashboard;
