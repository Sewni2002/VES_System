import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/licApi";
import axios from "axios";
import "./LICDeadlines.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";


export default function LICDeadlines() {
  // ---- Header + session (copy-paste pack) ----
  const licID = localStorage.getItem("licID");
  const [lic, setLic] = useState(null);
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

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
  

  const navigate = useNavigate();

  // Type: deadline | instruction | mark
  const [type, setType] = useState("deadline");
  const [audience, setAudience] = useState("yearModule");
  const [year, setYear] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [context, setContext] = useState("");
  const [details, setDetails] = useState("");

  // Deadline-only
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Instruction-only
  const [attachments, setAttachments] = useState([{ label: "", url: "" }]);

  // Mark Allocation–only
  const [totalMarks, setTotalMarks] = useState(100);
  const [criteria, setCriteria] = useState([
    { name: "Easy Question", weight: 40 },
    { name: "Intermediate Level Question", weight: 30 },
    { name: "Hard Question", weight: 30 },
  ]);

  const isDeadline = type === "deadline";
  const isInstruction = type === "instruction";
  const isMark = type === "mark";

  useEffect(() => {
    if (type === "instruction" || type === "mark") setAudience("yearModule");
  }, [type]);

  const sumWeights = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);

  const canSubmit = useMemo(() => {
    if (!type) return false;
    if (audience !== "yearModule") return false;
    if (!year) return false;
    if (!moduleCode) return false;
    if (!context.trim()) return false;

    if (isDeadline) {
      if (!startDate || !endDate) return false;
      if (new Date(startDate) > new Date(endDate)) return false;
    }

    if (isMark) {
      if (!totalMarks || Number(totalMarks) <= 0) return false;
      if (criteria.length !== 3) return false;
      if (sumWeights !== 100) return false;
      if (!criteria.every((c) => Number(c.weight) >= 0 && Number(c.weight) <= 100)) return false;
    }

    return true;
  }, [
    type,
    audience,
    year,
    moduleCode,
    context,
    isDeadline,
    startDate,
    endDate,
    isMark,
    totalMarks,
    criteria,
    sumWeights,
  ]);

  // Attachments helpers
  const addAttachment = () => setAttachments((list) => [...list, { label: "", url: "" }]);
  const updateAttachment = (idx, key, value) =>
    setAttachments((list) => list.map((a, i) => (i === idx ? { ...a, [key]: value } : a)));
  const removeAttachment = (idx) => setAttachments((list) => list.filter((_, i) => i !== idx));

  // Criteria helpers
  const updateCriterion = (idx, key, value) =>
    setCriteria((list) => list.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));

  // Save/Publish
  const saveToBackend = async () => {
    if (audience !== "yearModule") {
      alert("For now, please choose 'Specific Year + Module' so the backend has both filters.");
      return;
    }

    const payloadCommon = {
      year: Number(year),
      moduleCode,
      context,
      details: details || "",
    };

    if (isDeadline) {
      const payload = {
        ...payloadCommon,
        startDate,
        endDate,
        createdBy: "LIC-UI",
      };
      await api.post("/deadlines", payload);
      return;
    }

    if (isInstruction) {
      const payload = {
        ...payloadCommon,
        attachments: attachments.filter((a) => a.label || a.url),
        createdBy: "LIC-UI",
      };
      await api.post("/instructions", payload);
      return;
    }

    if (isMark) {
      const payload = {
        year: Number(year),
        moduleCode,
        context,
        totalMarks: Number(totalMarks),
        criteria: criteria.map((c) => ({ name: c.name.trim(), weight: Number(c.weight) })),
        createdBy: "LIC-UI",
      };
      await api.post("/mark-allocations", payload);
      return;
    }
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    try {
      await saveToBackend();
      alert(isMark ? "Mark allocation saved." : "Saved to backend successfully.");
    } catch (err) {
      console.error(err);
      alert(`Save failed: ${err?.response?.status || ""} ${JSON.stringify(err?.response?.data || {})}`);
    }
  };

  const handlePublish = async () => {
    if (!canSubmit) return;
    try {
      await saveToBackend();
      navigate("/deadlines/view");
    } catch (err) {
      console.error(err);
      alert(
        `Publish failed: ${err?.response?.status || ""} ${JSON.stringify(err?.response?.data || {})}`
      );
    }
  };

  
  return (
   <>
       <NavLIC/>
      {/* Header (session + clock + menu) */}
     
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
            <h1 className="title">Deadlines, Instructions & Marks</h1>
            <Link to="/deadlines/view" className="btn ghost">Check Created Items →</Link>
          </div>

          <div className="card">
            {/* Type */}
            <div className="row">
              <label className="lbl">Type</label>
              <div className="seg">
                <button
                  type="button"
                  className={`segBtn ${isDeadline ? "active" : ""}`}
                  onClick={() => setType("deadline")}
                >
                  Deadline
                </button>
                <button
                  type="button"
                  className={`segBtn ${isInstruction ? "active" : ""}`}
                  onClick={() => setType("instruction")}
                >
                  Instruction
                </button>
                <button
                  type="button"
                  className={`segBtn ${isMark ? "active" : ""}`}
                  onClick={() => setType("mark")}
                >
                  Mark Allocation
                </button>
              </div>
            </div>

            {/* Year */}
            <div className="row">
              <label className="lbl">Academic Year</label>
              <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            {/* Module */}
            <div className="row">
              <label className="lbl">Module</label>
              <input
                className="input"
                placeholder="e.g., Y2S1-IT201"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
              />
            </div>

            {/* Context + details */}
            <div className="row">
              <label className="lbl">Context / Title</label>
              <input
                className="input"
                placeholder={
                  isDeadline
                    ? "e.g., Project Proposal Submission"
                    : isInstruction
                    ? "e.g., Viva Day Guidelines"
                    : "e.g., Final Viva Marking Scheme"
                }
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <div className="row">
              <label className="lbl">Details (optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Extra information or notes"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            {/* Deadline-only */}
            {isDeadline && (
              <div className="grid2">
                <div className="row">
                  <label className="lbl">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="row">
                  <label className="lbl">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Instruction-only */}
            {isInstruction && (
              <div className="row stack">
                <label className="lbl">Attachments (optional)</label>
                <div className="attachList">
                  {attachments.map((a, idx) => (
                    <div className="attachRow" key={idx}>
                      <input
                        className="input"
                        placeholder="Label (e.g., Rubric)"
                        value={a.label}
                        onChange={(e) => updateAttachment(idx, "label", e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Link URL (e.g., https://...)"
                        value={a.url}
                        onChange={(e) => updateAttachment(idx, "url", e.target.value)}
                      />
                      <button
                        type="button"
                        className="miniBtn danger"
                        onClick={() => removeAttachment(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className="miniBtn" onClick={addAttachment}>
                  + Add another
                </button>
              </div>
            )}

            {/* Mark-only */}
            {isMark && (
              <>
                <div className="row">
                  <label className="lbl">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>

                <div className="row stack">
                  <label className="lbl">Allocation (must total 100%)</label>
                  <div className="attachList">
                    {criteria.map((c, idx) => (
                      <div className="attachRow" key={idx}>
                        <input className="input" value={c.name} disabled />
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="%"
                          value={c.weight}
                          onChange={(e) => updateCriterion(idx, "weight", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="hint" style={{ marginTop: 8 }}>
                    Current total: <strong>{sumWeights}%</strong>
                    {sumWeights !== 100 ? " (must be 100%)" : ""}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="actions">
              <button className="btn" onClick={handleSave} disabled={!canSubmit}>
                Save Draft
              </button>
              <button className="btn run" onClick={handlePublish} disabled={!canSubmit}>
                Publish →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
