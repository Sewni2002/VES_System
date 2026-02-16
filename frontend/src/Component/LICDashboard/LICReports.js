// src/pages/Reports.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./LICReports.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";


const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default function Reports() {
  const licID = localStorage.getItem("licID");
  const [lic, setLic] = useState(null);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Data
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [markAllocations, setMarkAllocations] = useState([]); 
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterModule, setFilterModule] = useState("");
  const [dateFrom, setDateFrom] = useState(""); 
  const [dateTo, setDateTo] = useState("");

  //Header/session 
  useEffect(() => {
    if (licID) {
      axios
        .get(`http://localhost:5000/api/licprofilemanage/${licID}`)
        .then((res) => setLic(res.data))
        .catch((err) => console.error(err));
    }
  }, [licID]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Load report data 
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const [grp, top, dl, ins, mods, marks] = await Promise.all([
          api.get("/groups").catch(() => ({ data: [] })),
          api.get("/topics").catch(() => ({ data: [] })),
          api.get("/deadlines").catch(() => ({ data: [] })),
          api.get("/instructions").catch(() => ({ data: [] })),
          api.get("/modules").catch(() => ({ data: [] })), // for module list
          api.get("/mark-allocations").catch(() => ({ data: [] })), // optional; ok if 404
        ]);

        setGroups(Array.isArray(grp.data) ? grp.data : grp.data?.items || []);
        setTopics(Array.isArray(top.data) ? top.data : top.data?.items || []);
        setDeadlines(Array.isArray(dl.data) ? dl.data : dl.data?.items || []);
        setInstructions(Array.isArray(ins.data) ? ins.data : ins.data?.items || []);
        setModules(Array.isArray(mods.data) ? mods.data : mods.data?.items || []);
        setMarkAllocations(
          Array.isArray(marks.data) ? marks.data : marks.data?.items || []
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load data for reports.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  
  const applyFilters = React.useCallback((arr, mappers = {}) => {
  const getYear = mappers.year || ((x) => x.year);
  const getSem = mappers.semester || ((x) => x.semester);
  const getMod = mappers.module || ((x) => x.moduleCode || x.moduleId);

  return arr.filter((x) => {
    if (filterYear && Number(getYear(x)) !== Number(filterYear)) return false;
    if (filterSemester && Number(getSem(x)) !== Number(filterSemester)) return false;
    if (filterModule && String(getMod(x)) !== String(filterModule)) return false;
    return true;
  });
}, [filterYear, filterSemester, filterModule]);


  const moduleOptions = useMemo(() => {
    const set = new Set(
      modules.map((m) => m.moduleId || m.moduleCode).filter(Boolean)
    );
    return Array.from(set).sort();
  }, [modules]);

  // Filtered datasets
  const fGroups = useMemo(() => applyFilters(groups), [groups, filterYear, filterSemester, filterModule]);
  const fTopics = useMemo(() => applyFilters(topics), [topics, filterYear, filterSemester, filterModule]);
  const fDeadlines = useMemo(() => {
    let list = applyFilters(deadlines);
    const toDate = (v) => (v ? new Date(v) : null);
    if (dateFrom) {
      const from = new Date(dateFrom);
      list = list.filter((d) => {
        const dd = toDate(d.endDate) || toDate(d.startDate);
        return dd ? dd >= from : false;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo);
      list = list.filter((d) => {
        const dd = toDate(d.endDate) || toDate(d.startDate);
        return dd ? dd <= to : false;
      });
    }
    return list;
  }, [deadlines, filterYear, filterSemester, filterModule, dateFrom, dateTo]);

  const fInstructions = useMemo(
    () => applyFilters(instructions),
    [instructions, filterYear, filterSemester, filterModule]
  );

  const fMarkAllocations = useMemo(
    () =>
      applyFilters(markAllocations, {
        year: (m) => m.year,
        semester: (m) => m.semester,
        module: (m) => m.moduleCode,
      }),
    [markAllocations, filterYear, filterSemester, filterModule]
  );

 
  const addPlaceholderHeader = (doc, title) => {
    
    doc.setFontSize(12);
    doc.text("Viva Evaluation System", 14, 16);
    doc.text("Department of Computing", 14, 22);

    doc.setFontSize(18);
    doc.text(title, 14, 36);

    doc.setFontSize(10);
    const genDate = new Date().toLocaleString();
    doc.text(`Date Generated: ${genDate}`, 14, 44);
    doc.text(`Generated By: LIC Officer System`, 14, 50);
  };

  const saveDoc = (doc, name) => {
    const safe = name.replace(/\s+/g, "_");
    doc.save(`${safe}.pdf`);
  };

  
  const exportGroups = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Groups Report");

    const rows = fGroups.map((g, idx) => {
      const size = Array.isArray(g.members) ? g.members.length : g.membersCount ?? 0;
      return [
        idx + 1,
        g.groupId || "—",
        g.groupName || "—",
        g.year ?? "—",
        g.semester ?? "—",
        g.moduleCode || "—",
        g.topicId ? `${g.topicId} — ${g.topicName || ""}` : "—",
        size,
        g.assignedBy || "—",
        (g.assignedDate ? new Date(g.assignedDate).toLocaleDateString() : "—"),
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [[
        "#", "Group ID", "Name", "Year", "Sem", "Module",
        "Topic", "Members", "Assigned By", "Assigned Date"
      ]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    saveDoc(doc, "Groups_Report");
  };

  const exportTopics = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Topics Report");

    const rows = fTopics.map((t, i) => [
      i + 1,
      t.topicId || "—",
      t.name || "—",
      t.year ?? "—",
      t.semester ?? "—",
      t.moduleCode || "—",
      (Array.isArray(t.tags) ? t.tags.join(", ") : "—"),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["#", "Topic ID", "Name", "Year", "Sem", "Module", "Tags"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    saveDoc(doc, "Topics_Report");
  };

  const exportDeadlines = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Deadlines Report");

    const rows = fDeadlines.map((d, i) => [
      i + 1,
      d.context || "—",
      d.year ?? "—",
      d.semester ?? "—",
      d.moduleCode || "—",
      d.startDate ? new Date(d.startDate).toLocaleDateString() : "—",
      d.endDate ? new Date(d.endDate).toLocaleDateString() : "—",
      (d.details || "").slice(0, 80),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["#", "Title/Context", "Year", "Sem", "Module", "Start", "End", "Details"]],
      body: rows,
      styles: { fontSize: 9, cellWidth: "wrap" },
      headStyles: { fillColor: [6, 182, 212] },
      columnStyles: {
        7: { cellWidth: 80 },
      },
    });

    saveDoc(doc, "Deadlines_Report");
  };

  const exportInstructions = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Instructions Report");

    const rows = fInstructions.map((ins, i) => [
      i + 1,
      ins.context || ins.title || "—",
      ins.year ?? "—",
      ins.semester ?? "—",
      ins.moduleCode || "—",
      (Array.isArray(ins.tags) ? ins.tags.join(", ") : "—"),
      (ins.details || "").slice(0, 80),
    ]);

    autoTable(doc, {
      startY: 60,
      head: [["#", "Title", "Year", "Sem", "Module", "Tags", "Details"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 182, 212] },
      columnStyles: {
        6: { cellWidth: 80 },
      },
    });

    saveDoc(doc, "Instructions_Report");
  };

  const exportMarkAllocations = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Mark Allocation Report");

    const rows = fMarkAllocations.map((m, i) => {
      const crit = Array.isArray(m.criteria)
        ? m.criteria.map((c) => `${c.name}: ${c.weight}%`).join(" | ")
        : "—";
      return [
        i + 1,
        m.year ?? "—",
        m.semester ?? "—",
        m.moduleCode || "—",
        m.context || "—",
        m.totalMarks ?? "—",
        crit,
      ];
    });

    autoTable(doc, {
      startY: 60,
      head: [["#", "Year", "Sem", "Module", "Context", "Total Marks", "Criteria"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [6, 182, 212] },
      columnStyles: {
        6: { cellWidth: 90 },
      },
    });

    saveDoc(doc, "Mark_Allocations_Report");
  };

  const exportCombined = () => {
    const doc = new jsPDF();
    addPlaceholderHeader(doc, "LIC Combined Report");

    let y = 60;

    // Groups
    autoTable(doc, {
      startY: y,
      head: [[
        "Groups",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ]],
      theme: "plain",
      styles: { fontStyle: "bold" },
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [[
        "#","Group ID","Name","Year","Sem","Module","Topic","Members","By","Date"
      ]],
      body: fGroups.map((g, i) => [
        i + 1,
        g.groupId || "—",
        g.groupName || "—",
        g.year ?? "—",
        g.semester ?? "—",
        g.moduleCode || "—",
        g.topicId ? `${g.topicId} — ${g.topicName || ""}` : "—",
        Array.isArray(g.members) ? g.members.length : (g.membersCount ?? 0),
        g.assignedBy || "—",
        g.assignedDate ? new Date(g.assignedDate).toLocaleDateString() : "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    // Topics
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Topics"]], theme: "plain", styles: { fontStyle: "bold" },
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [["#","Topic ID","Name","Year","Sem","Module","Tags"]],
      body: fTopics.map((t, i) => [
        i + 1, t.topicId || "—", t.name || "—", t.year ?? "—", t.semester ?? "—",
        t.moduleCode || "—", Array.isArray(t.tags) ? t.tags.join(", ") : "—"
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    // Deadlines
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Deadlines"]], theme: "plain", styles: { fontStyle: "bold" },
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [["#","Title","Year","Sem","Module","Start","End"]],
      body: fDeadlines.map((d, i) => [
        i + 1,
        d.context || "—",
        d.year ?? "—",
        d.semester ?? "—",
        d.moduleCode || "—",
        d.startDate ? new Date(d.startDate).toLocaleDateString() : "—",
        d.endDate ? new Date(d.endDate).toLocaleDateString() : "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    // Instructions
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 8,
      head: [["Instructions"]], theme: "plain", styles: { fontStyle: "bold" },
    });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      head: [["#","Title","Year","Sem","Module"]],
      body: fInstructions.map((ins, i) => [
        i + 1,
        ins.context || ins.title || "—",
        ins.year ?? "—",
        ins.semester ?? "—",
        ins.moduleCode || "—",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [6, 182, 212] },
    });

    // Mark Allocations 
    if (fMarkAllocations.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 8,
        head: [["Mark Allocations"]], theme: "plain", styles: { fontStyle: "bold" },
      });
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 2,
        head: [["#","Year","Sem","Module","Context","Total"]],
        body: fMarkAllocations.map((m, i) => [
          i + 1, m.year ?? "—", m.semester ?? "—", m.moduleCode || "—",
          m.context || "—", m.totalMarks ?? "—"
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [6, 182, 212] },
      });
    }

    saveDoc(doc, "LIC_Combined_Report");
  };

  return (

    <>
          <NavLIC/>
    <div className="wrap">
      {/* ===== Header ===== */}
      
      {/* ===== Sidebar (UNCHANGED) ===== */}
      <div className="sidebar">
        <div className="profile">
          <div className="avatar">        <img src={qImage} alt="profile" />
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

      {/*Main*/}
      <div className="main">
        <h1 className="title">Reports</h1>

        {/* Filters */}
       <div
  className="card"
  style={{
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e5e5",
  }}
>
  <div
    className="filters"
    style={{
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      fontFamily: "Segoe UI, sans-serif",
      fontSize: 14,
      color: "#333",
    }}
  >
    <strong style={{ color: "#222", fontSize: 15 }}>Filters:</strong>

    <select
      value={filterYear}
      onChange={(e) => setFilterYear(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        outline: "none",
        backgroundColor: "#fafafa",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.target.style.borderColor = "#007bff")}
      onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
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
        borderRadius: 8,
        border: "1px solid #ccc",
        outline: "none",
        backgroundColor: "#fafafa",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.target.style.borderColor = "#007bff")}
      onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
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
        borderRadius: 8,
        border: "1px solid #ccc",
        outline: "none",
        backgroundColor: "#fafafa",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.target.style.borderColor = "#007bff")}
      onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
    >
      <option value="">All Modules</option>
      {moduleOptions.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>

    <span
      className="muted"
      style={{
        color: "#555",
        fontSize: 13,
        fontStyle: "italic",
        marginLeft: 6,
      }}
    >
      Deadlines range:
    </span>

    <input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        backgroundColor: "#fafafa",
        outline: "none",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.target.style.borderColor = "#007bff")}
      onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
    />

    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #ccc",
        backgroundColor: "#fafafa",
        outline: "none",
        cursor: "pointer",
        transition: "0.2s",
      }}
      onMouseOver={(e) => (e.target.style.borderColor = "#007bff")}
      onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
    />

    <button
      className="miniBtn"
      onClick={() => {
        setFilterYear("");
        setFilterSemester("");
        setFilterModule("");
        setDateFrom("");
        setDateTo("");
      }}
      style={{
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        padding: "6px 14px",
        borderRadius: 8,
        cursor: "pointer",
        transition: "0.2s",
        fontWeight: 500,
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
      onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
    >
      Reset
    </button>
  </div>
</div>


        {/* Export Blocks */}
        <div className="card">
          <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Groups</h3>
            <button className="btn" onClick={exportGroups}>Export PDF</button>
          </div>
          <div className="muted" style={{ marginBottom: 8 }}>Preview (first 10 rows)</div>
          <div className="table">
            <div className="tHead">
              <span>Group ID</span><span>Name</span><span>Year</span><span>Sem</span><span>Module</span><span>Members</span><span>Topic</span>
            </div>
            {(fGroups.slice(0, 10)).map((g) => (
              <div className="tRow" key={g._id || g.groupId}>
                <span>{g.groupId || "—"}</span>
                <span>{g.groupName || "—"}</span>
                <span>{g.year ?? "—"}</span>
                <span>{g.semester ?? "—"}</span>
                <span>{g.moduleCode || "—"}</span>
                <span>{Array.isArray(g.members) ? g.members.length : (g.membersCount ?? 0)}</span>
                <span>{g.topicId ? `${g.topicId} — ${g.topicName || ""}` : "—"}</span>
              </div>
            ))}
            {fGroups.length === 0 && <div className="empty">No data</div>}
          </div>
        </div>

        <div className="card">
          <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Topics</h3>
            <button className="btn" onClick={exportTopics}>Export PDF</button>
          </div>
          <div className="muted" style={{ marginBottom: 8 }}>Preview (first 10 rows)</div>
          <div className="table">
            <div className="tHead">
              <span>Topic ID</span><span>Name</span><span>Year</span><span>Sem</span><span>Module</span><span>Tags</span>
            </div>
            {(fTopics.slice(0, 10)).map((t) => (
              <div className="tRow" key={t._id || t.topicId}>
                <span>{t.topicId}</span>
                <span title={t.name}>{t.name}</span>
                <span>{t.year}</span>
                <span>{t.semester}</span>
                <span>{t.moduleCode}</span>
                <span>{Array.isArray(t.tags) ? t.tags.join(", ") : "—"}</span>
              </div>
            ))}
            {fTopics.length === 0 && <div className="empty">No data</div>}
          </div>
        </div>

        <div className="card">
          <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Deadlines</h3>
            <button className="btn" onClick={exportDeadlines}>Export PDF</button>
          </div>
          <div className="muted" style={{ marginBottom: 8 }}>Preview (first 10 rows)</div>
          <div className="table">
            <div className="tHead">
              <span>Title</span><span>Year</span><span>Sem</span><span>Module</span><span>Start</span><span>End</span>
            </div>
            {(fDeadlines.slice(0, 10)).map((d) => (
              <div className="tRow" key={d._id}>
                <span>{d.context || "—"}</span>
                <span>{d.year ?? "—"}</span>
                <span>{d.semester ?? "—"}</span>
                <span>{d.moduleCode || "—"}</span>
                <span>{d.startDate ? new Date(d.startDate).toLocaleDateString() : "—"}</span>
                <span>{d.endDate ? new Date(d.endDate).toLocaleDateString() : "—"}</span>
              </div>
            ))}
            {fDeadlines.length === 0 && <div className="empty">No data</div>}
          </div>
        </div>

        <div className="card">
          <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Instructions</h3>
            <button className="btn" onClick={exportInstructions}>Export PDF</button>
          </div>
          <div className="muted" style={{ marginBottom: 8 }}>Preview (first 10 rows)</div>
          <div className="table">
            <div className="tHead">
              <span>Title</span><span>Year</span><span>Sem</span><span>Module</span><span>Tags</span>
            </div>
            {(fInstructions.slice(0, 10)).map((ins) => (
              <div className="tRow" key={ins._id}>
                <span>{ins.context || ins.title || "—"}</span>
                <span>{ins.year ?? "—"}</span>
                <span>{ins.semester ?? "—"}</span>
                <span>{ins.moduleCode || "—"}</span>
                <span>{Array.isArray(ins.tags) ? ins.tags.join(", ") : "—"}</span>
              </div>
            ))}
            {fInstructions.length === 0 && <div className="empty">No data</div>}
          </div>
        </div>

        {/* Mark Allocations block  */}
        {fMarkAllocations.length > 0 && (
          <div className="card">
            <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Mark Allocations</h3>
              <button className="btn" onClick={exportMarkAllocations}>Export PDF</button>
            </div>
            <div className="muted" style={{ marginBottom: 8 }}>Preview (first 10 rows)</div>
            <div className="table">
              <div className="tHead">
                <span>Year</span><span>Sem</span><span>Module</span><span>Context</span><span>Total</span>
              </div>
              {(fMarkAllocations.slice(0, 10)).map((m, idx) => (
                <div className="tRow" key={m._id || idx}>
                  <span>{m.year ?? "—"}</span>
                  <span>{m.semester ?? "—"}</span>
                  <span>{m.moduleCode || "—"}</span>
                  <span>{m.context || "—"}</span>
                  <span>{m.totalMarks ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Combined export */}
        <div className="card secondary">
          <div className="sectionHeader" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Export Everything</h3>
            <button className="btn" onClick={exportCombined}>Export Combined PDF</button>
          </div>
          <div className="muted">
            Exports Groups, Topics, Deadlines, Instructions{fMarkAllocations.length ? ", Mark Allocations" : ""} into one PDF with placeholders.
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
