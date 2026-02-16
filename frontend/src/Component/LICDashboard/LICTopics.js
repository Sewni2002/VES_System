// src/pages/LICTopics.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/licApi";
import axios from "axios";
import "./LICDeadlines.css";
import "./LICTopics.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";

export default function LICTopics() {
  /* ---------- Header + session (shared) ---------- */
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
  /* ------------------------------------------------ */

  const [form, setForm] = useState({
    topicId: "",
    name: "",
    year: "",
    semester: "",
    moduleCode: "",
    tags: "",
  });

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [editId, setEditId] = useState(null);

  const [modules, setModules] = useState([]);
  const [modsLoading, setModsLoading] = useState(false);
  const [modsErr, setModsErr] = useState("");

  const loadTopics = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await api.get("/topics", { params: { limit: 200 } });
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setTopics(items);
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  // Reset module selection when year/semester change
  useEffect(() => {
    setForm((f) => ({ ...f, moduleCode: "" }));
  }, [form.year, form.semester]);

  // Fetch modules for selected year + semester
  useEffect(() => {
    const y = Number(form.year),
      s = Number(form.semester);
    if (!y || !s) {
      setModules([]);
      setModsErr("");
      return;
    }

    (async () => {
      try {
        setModsLoading(true);
        setModsErr("");
        const res = await api.get("/modules", {
          params: { academicYear: y, semester: s, isActive: true, limit: 200 },
        });
        const items = Array.isArray(res.data) ? res.data : res.data.items || [];
        setModules(items);
      } catch (e) {
        console.error(e);
        setModules([]);
        setModsErr(e?.response?.data?.message || "Failed to load modules.");
      } finally {
        setModsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.year, form.semester]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      topicId: "",
      name: "",
      year: "",
      semester: "",
      moduleCode: "",
      tags: "",
    });
    setEditId(null);
  };

  const validate = () => {
    const { topicId, name, year, semester, moduleCode } = form;
    if (!topicId || !name || !year || !semester || !moduleCode) return false;
    const y = Number(year),
      s = Number(semester);
    if (!y || y < 1) return false;
    if (![1, 2].includes(s)) return false;
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please fill all fields correctly.");
      return;
    }
    const payload = {
      topicId: form.topicId.trim(),
      name: form.name.trim(),
      year: Number(form.year),
      semester: Number(form.semester),
      moduleCode: form.moduleCode.trim(),
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    };

    try {
      if (editId) {
        // topicId is immutable on backend; don't send it on update
        const { topicId, ...rest } = payload;
        await api.put(`/topics/${editId}`, rest);
        alert("Topic updated.");
      } else {
        await api.post("/topics", payload);
        alert("Topic added.");
      }
      await loadTopics();
      resetForm();
    } catch (e2) {
      console.error(e2?.response?.data || e2);
      alert(e2?.response?.data?.message || "Save failed.");
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setForm({
      topicId: row.topicId,
      name: row.name,
      year: String(row.year ?? ""),
      semester: String(row.semester ?? ""),
      moduleCode: row.moduleCode || "",
      tags: (row.tags || []).join(", "),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete topic ${row.topicId}?`)) return;
    try {
      await api.delete(`/topics/${row._id}`);
      await loadTopics();
      if (editId === row._id) resetForm();
      alert("Topic deleted.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Delete failed.");
    }
  };

  // ---------- single return with header at top ----------
  return (
    <>
          <NavLIC/>
    
      

      {/* Layout */}
      <div className="wrap">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile">
            <div className="avatar">        <img src={qImage} alt="profile" />
            </div>
            <div className="name">{lic?.name || "LIC Officer"}</div>
          </div>

          {/* If you adopted the pinned bottom pattern, split menu as below.
              Otherwise keep a single .menu with all links. */}
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
            <h1 className="title">Topic Management</h1>
            <button className="btn ghost" onClick={resetForm}>
              {editId ? "Cancel Edit" : "Reset Form"}
            </button>
          </div>

          {/* Form */}
          <div className="card">
            <form onSubmit={handleSave}>
              <div className="grid2">
                <div className="row">
                  <label className="lbl">Topic ID</label>
                  <input
                    className="input"
                    name="topicId"
                    placeholder="TP001"
                    value={form.topicId}
                    onChange={onChange}
                    disabled={!!editId}
                  />
                </div>
                <div className="row">
                  <label className="lbl">Name</label>
                  <input
                    className="input"
                    name="name"
                    placeholder="E-Commerce Platform"
                    value={form.name}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="grid3">
                <div className="row">
                  <label className="lbl">Year</label>
                  <select className="input" name="year" value={form.year} onChange={onChange}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>

                <div className="row">
                  <label className="lbl">Semester</label>
                  <select className="input" name="semester" value={form.semester} onChange={onChange}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </div>

                <div className="row">
                  <label className="lbl">Module</label>
                  <select
                    className="input"
                    name="moduleCode"
                    value={form.moduleCode}
                    onChange={onChange}
                    disabled={!form.year || !form.semester || modsLoading}
                  >
                    <option value="">
                      {!form.year || !form.semester
                        ? "Select year & semester first"
                        : modsLoading
                        ? "Loading modules…"
                        : modules.length
                        ? "Select module"
                        : "No modules found"}
                    </option>
                    {modules.map((m) => (
                      <option key={m._id || m.moduleId} value={m.moduleId}>
                        {m.moduleId} — {m.moduleName}
                      </option>
                    ))}
                  </select>
                  {modsErr && (
                    <div className="error" style={{ marginTop: 6 }}>
                      {modsErr}
                    </div>
                  )}
                </div>
              </div>

              <div className="row">
                <label className="lbl">Tags (optional)</label>
                <input
                  className="input"
                  name="tags"
                  placeholder="web, fullstack"
                  value={form.tags}
                  onChange={onChange}
                />
              </div>

              <div className="actions">
                <button type="submit" className="btn">
                  {editId ? "Update Topic" : "Add Topic"}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="card">
            <div className="tableHeader">
              <h3>Topics</h3>
              <span className="muted">{topics.length} item(s)</span>
            </div>

            {loading ? (
              <div className="empty">Loading…</div>
            ) : err ? (
              <div className="error">{err}</div>
            ) : (
              <div className="table">
                <div className="tHead topicsHead">
                  <span>Topic ID</span>
                  <span>Name</span>
                  <span>Year</span>
                  <span>Semester</span>
                  <span>Module</span>
                  <span>Actions</span>
                </div>
                {topics.length === 0 ? (
                  <div className="empty">No topics yet.</div>
                ) : (
                  topics.map((t) => (
                    <div className="tRow" key={t._id}>
                      <span>{t.topicId}</span>
                      <span title={t.name}>{t.name}</span>
                      <span>{t.year}</span>
                      <span>{t.semester}</span>
                      <span>{t.moduleCode}</span>
                      <span className="rowActions">
                        <button className="miniBtn" onClick={() => handleEdit(t)}>
                          Edit
                        </button>
                        <button className="miniBtn danger" onClick={() => handleDelete(t)}>
                          Delete
                        </button>
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
