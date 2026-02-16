import React, { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/licApi";
import "./LICDeadlines.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";

import axios from "axios";
export default function LICDeadlines_View() {
  const [deadlines, setDeadlines] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

    const licID = localStorage.getItem("licID");
    const [lic, setLic] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
   const [time, setTime] = useState(new Date());
    //const [currentGroup, setCurrentGroup] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);


  const loadAll = async () => {
    try {
      setLoading(true);
      setErr("");

      const [dlRes, insRes, markRes] = await Promise.all([
        api.get("/deadlines"),
        api.get("/instructions"),
        api.get("/mark-allocations"),
      ]);

      const dl  = Array.isArray(dlRes.data)   ? dlRes.data   : (dlRes.data.items   || []);
      const ins = Array.isArray(insRes.data)  ? insRes.data  : (insRes.data.items  || []);
      const mk  = Array.isArray(markRes.data) ? markRes.data : (markRes.data.items || []);

      setDeadlines(dl);
      setInstructions(ins);
      setMarks(mk);
    } catch (e) {
      console.error(e);
      setErr("Failed to load data. Check backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ---------- helpers ----------
  const parseYearKeep = (input, current) => {
    // if user cancels: input === null -> keep
    if (input === null) return current;
    // if user leaves blank: "" -> keep
    if (String(input).trim() === "") return current;
    const y = Number(input);
    return Number.isFinite(y) && y >= 1 ? y : current;
  };

  const parseStringKeep = (input, current) => {
    if (input === null) return current;
    const t = String(input);
    return t.trim() === "" ? current : t.trim();
  };

  const parseDateKeep = (input, current) => {
    if (input === null) return current;
    const t = String(input).trim();
    if (!t) return current;
    // Accept YYYY-MM-DD, let backend/mongoose parse it
    return t;
  };

  // ---------- Deadlines: Edit / Delete ----------
  const editDeadline = async (doc) => {
    const context   = parseStringKeep(window.prompt("Update context/title:", doc.context), doc.context);
    const year      = parseYearKeep(window.prompt("Update year:", String(doc.year)), doc.year);
    const moduleCode= parseStringKeep(window.prompt("Update module code:", doc.moduleCode), doc.moduleCode);
    const startDate = parseDateKeep(window.prompt("Update start date (YYYY-MM-DD):", (doc.startDate || "").slice(0,10)), doc.startDate);
    const endDate   = parseDateKeep(window.prompt("Update end date (YYYY-MM-DD):",   (doc.endDate   || "").slice(0,10)), doc.endDate);
    const details   = parseStringKeep(window.prompt("Update details (optional):", doc.details || ""), doc.details || "");

    const payload = { context, year, moduleCode, startDate, endDate, details };

    try {
      await api.put(`/deadlines/${doc._id}`, payload);
      await loadAll();
      alert("Deadline updated.");
    } catch (e) {
      console.error(e?.response?.data || e);
      alert(e?.response?.data?.message || "Update failed.");
    }
  };

  const deleteDeadline = async (doc) => {
    if (!window.confirm("Delete this deadline?")) return;
    try {
      await api.delete(`/deadlines/${doc._id}`);
      await loadAll();
      alert("Deadline deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  // ---------- Instructions: Edit / Delete ----------
  const editInstruction = async (doc) => {
    const context    = parseStringKeep(window.prompt("Update context/title:", doc.context), doc.context);
    const year       = parseYearKeep(window.prompt("Update year:", String(doc.year ?? "")), doc.year ?? 1);
    const moduleCode = parseStringKeep(window.prompt("Update module code:", doc.moduleCode ?? ""), doc.moduleCode ?? "");
    const details    = parseStringKeep(window.prompt("Update details (optional):", doc.details || ""), doc.details || "");

    // Optional: attachments as JSON
    const attachHint =
      "Update attachments as JSON array (or leave blank to keep), e.g.:\n" +
      `[{"label":"Rubric","url":"https://..."},{"label":"Slides","url":"https://..."}]`;
    const attachInput = window.prompt(attachHint, "");
    let attachments = doc.attachments || [];
    if (attachInput !== null && attachInput.trim() !== "") {
      try {
        const parsed = JSON.parse(attachInput);
        if (Array.isArray(parsed)) attachments = parsed;
        else alert("Attachments must be a JSON array. Keeping existing.");
      } catch {
        alert("Invalid JSON. Keeping existing attachments.");
      }
    }

    const payload = { context, year, moduleCode, details, attachments };

    try {
      await api.put(`/instructions/${doc._id}`, payload);
      await loadAll();
      alert("Instruction updated.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Update failed.");
    }
  };

  const deleteInstruction = async (doc) => {
    if (!window.confirm("Delete this instruction?")) return;
    try {
      await api.delete(`/instructions/${doc._id}`);
      await loadAll();
      alert("Instruction deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  // ---------- Mark Allocations: Edit / Delete ----------
  const editMark = async (doc) => {
    const context     = parseStringKeep(window.prompt("Update context/title:", doc.context), doc.context);
    const year        = parseYearKeep(window.prompt("Update year:", String(doc.year ?? "")), doc.year ?? 1);
    const moduleCode  = parseStringKeep(window.prompt("Update module code:", doc.moduleCode ?? ""), doc.moduleCode ?? "");
    const totalMarks  = (() => {
      const t = window.prompt("Update total marks:", String(doc.totalMarks ?? 100));
      if (t === null || String(t).trim() === "") return doc.totalMarks ?? 100;
      const n = Number(t);
      return Number.isFinite(n) && n > 0 ? n : doc.totalMarks ?? 100;
    })();

    const criteriaHint =
      "Update criteria as JSON array (or leave blank to keep), e.g.:\n" +
      `[{"name":"Easy Question","weight":40},{"name":"Intermediate Level Question","weight":30},{"name":"Hard Question","weight":30}]`;
    const criteriaInput = window.prompt(criteriaHint, "");
    let criteria = doc.criteria || [];
    if (criteriaInput !== null && criteriaInput.trim() !== "") {
      try {
        const parsed = JSON.parse(criteriaInput);
        if (Array.isArray(parsed)) criteria = parsed;
        else alert("Criteria must be a JSON array. Keeping existing.");
      } catch {
        alert("Invalid JSON. Keeping existing criteria.");
      }
    }

    const payload = { context, year, moduleCode, totalMarks, criteria };

    try {
      await api.put(`/mark-allocations/${doc._id}`, payload);
      await loadAll();
      alert("Mark allocation updated.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Update failed.");
    }
  };

  const deleteMark = async (doc) => {
    if (!window.confirm("Delete this mark allocation?")) return;
    try {
      await api.delete(`/mark-allocations/${doc._id}`);
      await loadAll();
      alert("Mark allocation deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };




    
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const toggleMenu = () => setMenuOpen(prev => !prev);
    
    const handleLogout = () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    };

  return (

     <>
          <NavLIC/>
    <div className="wrap">
      {/* Sidebar */}






      <div className="sidebar">
        <div className="profile">
          <div className="avatar">        <img src={qImage} alt="profile" />
          </div>
          <div className="name">LIC Officer</div>
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
          <h1 className="title">Created Deadlines, Instructions & Marks</h1>
          <Link to="/deadlines" className="btn ghost">+ New</Link>
        </div>

        {loading && <div className="card"><div className="empty">Loading…</div></div>}
        {err && <div className="card"><div className="error">{err}</div></div>}

        {/* Deadlines table */}
        {!loading && (
          <div className="card">
            <div className="tableHeader">
              <h3>Deadlines</h3>
              <span className="muted">{deadlines.length} item(s)</span>
            </div>
            <div className="table">
              <div className="tHead">
                <span>Year</span>
                <span>Module</span>
                <span>Context</span>
                <span>Start</span>
                <span>End</span>
                <span>Actions</span>
              </div>
              {deadlines.length === 0 ? (
                <div className="empty">No deadlines yet.</div>
              ) : (
                deadlines.map((d) => (
                  <div className="tRow" key={d._id}>
                    <span>{d.year}</span>
                    <span>{d.moduleCode}</span>
                    <span title={d.context}>{d.context}</span>
                    <span>{d.startDate ? String(d.startDate).slice(0, 10) : "—"}</span>
                    <span>{d.endDate ? String(d.endDate).slice(0, 10) : "—"}</span>
                    <span className="rowActions">
                      <button className="miniBtn" onClick={() => editDeadline(d)}>Edit</button>
                      <button className="miniBtn danger" onClick={() => deleteDeadline(d)}>Delete</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Instructions table */}
        {!loading && (
          <div className="card">
            <div className="tableHeader">
              <h3>Instructions</h3>
              <span className="muted">{instructions.length} item(s)</span>
            </div>
            <div className="table">
              <div className="tHead">
                <span>Year</span>
                <span>Module</span>
                <span>Context</span>
                <span>Attachments</span>
                <span>Actions</span>
              </div>
              {instructions.length === 0 ? (
                <div className="empty">No instructions yet.</div>
              ) : (
                instructions.map((d) => (
                  <div className="tRow" key={d._id}>
                    <span>{d.year}</span>
                    <span>{d.moduleCode}</span>
                    <span title={d.context}>{d.context}</span>
                    <span className="attachCell">
                      {(d.attachments || []).length === 0
                        ? "—"
                        : d.attachments.map((a, j) => (
                            <a key={j} href={a.url} target="_blank" rel="noreferrer">
                              {a.label || a.url}
                            </a>
                          ))}
                    </span>
                    <span className="rowActions">
                      <button className="miniBtn" onClick={() => editInstruction(d)}>Edit</button>
                      <button className="miniBtn danger" onClick={() => deleteInstruction(d)}>Delete</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mark Allocations table */}
        {!loading && (
          <div className="card">
            <div className="tableHeader">
              <h3>Mark Allocations</h3>
              <span className="muted">{marks.length} item(s)</span>
            </div>
            <div className="table">
              <div className="tHead">
                <span>Year</span>
                <span>Module</span>
                <span>Context</span>
                <span>Total Marks</span>
                <span>Criteria</span>
                <span>Actions</span>
              </div>
              {marks.length === 0 ? (
                <div className="empty">No mark allocations yet.</div>
              ) : (
                marks.map((m) => (
                  <div className="tRow" key={m._id}>
                    <span>{m.year}</span>
                    <span>{m.moduleCode}</span>
                    <span>{m.context}</span>
                    <span>{m.totalMarks}</span>
                    <span>
                      {(m.criteria || []).map((c, i) => (
                        <div key={i}>{c.name}: {c.weight}%</div>
                      ))}
                    </span>
                    <span className="rowActions">
                      <button className="miniBtn" onClick={() => editMark(m)}>Edit</button>
                      <button className="miniBtn danger" onClick={() => deleteMark(m)}>Delete</button>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
