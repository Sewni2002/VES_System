import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/licApi"; // baseURL: http://localhost:5000/api
import axios from "axios";
import "./LICGroups.css";
import NavLIC from "../nav/Licnavall";
import qImage from "../../assests/q.jpg";

export default function Groups() {
  // Header + session
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

  // ──────────────────────────────────────────────────────────────────────────────
  // Form state (added: balanceGender, balanceReligion as dropdowns)
  // ──────────────────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    year: "",
    semester: "",
    moduleCode: "",
    minSize: 4,
    maxSize: 4,
    useGpa: false,
    gpaMin: 3.5,
    perGroupCount: 1,
    topicStrategy: "sequential",

    // NEW: Optional balancing (dropdowns -> "off" | "on")
    balanceGender: "off",
    balanceReligion: "off",
  });

  // Modules from backend (filtered by year + semester)
  const [modules, setModules] = useState([]);
  const [loadingMods, setLoadingMods] = useState(false);
  const [modsErr, setModsErr] = useState("");

  // Draft state (inline preview on same page)
  const [draftGroups, setDraftGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState({ gen: false, save: false });

  // Restore saved rules (now includes new fields)
  useEffect(() => {
    const prev = localStorage.getItem("lic_group_rules_v1");
    if (prev) {
      try {
        const parsed = JSON.parse(prev);
        setForm({
          year: parsed.year ?? "",
          semester: parsed.semester ?? "",
          moduleCode: parsed.moduleCode ?? "",
          minSize: parsed.minSize ?? 4,
          maxSize: parsed.maxSize ?? 4,
          useGpa: !!parsed.useGpa,
          gpaMin: parsed.gpaMin ?? 3.5,
          perGroupCount: parsed.perGroupCount ?? 1,
          topicStrategy: parsed.topicStrategy ?? "sequential",

          balanceGender: parsed.balanceGender ?? "off",
          balanceReligion: parsed.balanceReligion ?? "off",
        });
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Load modules when year/semester changes
  useEffect(() => {
    setForm((f) => ({ ...f, moduleCode: "" }));
    const y = Number(form.year),
      s = Number(form.semester);
    if (!y || !s) {
      setModules([]);
      setModsErr("");
      return;
    }

    (async () => {
      try {
        setLoadingMods(true);
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
        setLoadingMods(false);
      }
    })();
  }, [form.year, form.semester]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Validation
  const isValid = useMemo(() => {
    if (!form.year) return false;
    if (!form.semester) return false;
    if (!form.moduleCode) return false;
    const min = Number(form.minSize),
      max = Number(form.maxSize);
    if (!min || !max || min < 2 || max < min) return false;
    if (form.useGpa) {
      const gpaMin = Number(form.gpaMin),
        perCnt = Number(form.perGroupCount);
      if (isNaN(gpaMin) || gpaMin < 0 || gpaMin > 4) return false;
      if (!perCnt || perCnt < 1) return false;
    }
    // balanceGender/balanceReligion are optional dropdowns; no extra validation needed
    return true;
  }, [form]);

  // Generate draft inline
  const handleGenerate = async () => {
    if (!isValid) return;
    try {
      setBusy((b) => ({ ...b, gen: true }));
      localStorage.setItem("lic_group_rules_v1", JSON.stringify(form));

      const payload = {
        year: Number(form.year),
        semester: Number(form.semester),
        moduleCode: form.moduleCode,
        groupSize: { min: Number(form.minSize), max: Number(form.maxSize) },

        gpaRule: form.useGpa
          ? { minGpa: Number(form.gpaMin), count: Number(form.perGroupCount) }
          : { minGpa: null, count: 0 },

        topicStrategy: form.topicStrategy,

        // NEW: pass balancing preferences to backend
        balance: {
          gender: form.balanceGender === "on",
          religion: form.balanceReligion === "on",
        },
      };

      const res = await api.post("/groups/generate-draft", payload);
      const { draftGroups: groups = [], summary: sum = null } = res.data || {};
      if (!groups.length) throw new Error("No draft groups returned.");

      setDraftGroups(groups);
      setSummary(sum);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Generate failed.");
      setDraftGroups([]);
      setSummary(null);
    } finally {
      setBusy((b) => ({ ...b, gen: false }));
    }
  };

  // Confirm & Save
  const handleSave = async () => {
    if (!draftGroups.length) return;
    try {
      setBusy((b) => ({ ...b, save: true }));

      const payload = draftGroups.map((g, i) => ({
        groupId: g.groupId,
        groupName: g.groupName || `Group ${i + 1}`,
        year: Number(g.year ?? form.year),
        semester: Number(g.semester ?? form.semester),
        moduleCode: String(g.moduleCode ?? form.moduleCode),
        members: (g.members || []).map((m) => ({
          studentDocId: m.studentDocId ?? m._id,
          studentId: m.studentId,
          name: m.name,
          currentGPA:
            typeof m.currentGPA === "number" ? m.currentGPA : m.GPA ?? null,
        })),
        topicId: g.topicId || null,
        topicName: g.topicName || null,
      }));

      const res = await api.post("/groups/save", payload);
      alert(res?.data?.message || "Groups saved successfully.");

      setDraftGroups([]);
      setSummary(null);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Save failed.");
    } finally {
      setBusy((b) => ({ ...b, save: false }));
    }
  };

  const handleResetForm = () => {
    setForm({
      year: "",
      semester: "",
      moduleCode: "",
      minSize: 4,
      maxSize: 4,
      useGpa: false,
      gpaMin: 3.5,
      perGroupCount: 1,
      topicStrategy: "sequential",

      balanceGender: "off",
      balanceReligion: "off",
    });
    setDraftGroups([]);
    setSummary(null);
  };

  return (
    <>
      <NavLIC />

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
          </div>
        </div>

        {/* Main */}
        <div className="main">
          <div className="pageHeader">
            <h1 className="title">Group Allocation</h1>
            <div className="headerActions">
              <Link to="/groups/list" className="btn ghost">
                View Saved Groups
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="sectionHeader">
              <h3>Allocation Settings</h3>
              <span className="muted">
                Define cohort, sizes, GPA rule, topic strategy, and optional balancing
              </span>
            </div>

            {/* Year / Semester / Module */}
            <div className="grid3">
              <div className="formRow">
                <label>Year</label>
                <select name="year" value={form.year} onChange={onChange}>
                  <option value="">Select year</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="formRow">
                <label>Semester</label>
                <select name="semester" value={form.semester} onChange={onChange}>
                  <option value="">Select semester</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div className="formRow">
                <label>Module</label>
                <select
                  name="moduleCode"
                  value={form.moduleCode}
                  onChange={onChange}
                  disabled={!form.year || !form.semester || loadingMods}
                >
                  <option value="">
                    {!form.year || !form.semester
                      ? "Select year & semester first"
                      : loadingMods
                      ? "Loading modules…"
                      : "Select module"}
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

            {/* Sizes + Topic Strategy */}
            <div className="grid3">
              <div className="formRow">
                <label>Min Group Size</label>
                <input
                  type="number"
                  name="minSize"
                  value={form.minSize}
                  onChange={onChange}
                />
              </div>
              <div className="formRow">
                <label>Max Group Size</label>
                <input
                  type="number"
                  name="maxSize"
                  value={form.maxSize}
                  onChange={onChange}
                />
              </div>
              <div className="formRow">
                <label>Topic Assignment</label>
                <select
                  name="topicStrategy"
                  value={form.topicStrategy}
                  onChange={onChange}
                >
                  <option value="sequential">Sequential</option>
                  <option value="random">Random</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* GPA toggle */}
            <div className="formRow checkboxRow">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  name="useGpa"
                  checked={form.useGpa}
                  onChange={onChange}
                />
                Use GPA balancing (optional)
              </label>
              <div className="hint">
                Turn off for Year 1 or when GPA should be ignored.
              </div>
            </div>

            {/* GPA settings */}
            {form.useGpa && (
              <div className="grid3">
                <div className="formRow">
                  <label>Min GPA</label>
                  <input
                    type="number"
                    step="0.1"
                    name="gpaMin"
                    value={form.gpaMin}
                    onChange={onChange}
                  />
                </div>
                <div className="formRow">
                  <label>Per-group Count</label>
                  <input
                    type="number"
                    name="perGroupCount"
                    value={form.perGroupCount}
                    onChange={onChange}
                  />
                </div>
                <div className="formRow">
                  <div className="note">
                    Ensures at least <b>{form.perGroupCount}</b> member(s) with
                    GPA ≥ <b>{form.gpaMin}</b> per group.
                  </div>
                </div>
              </div>
            )}

            {/* NEW: Balancing dropdowns */}
            <div className="grid3">
              <div className="formRow">
                <label>Balance by Gender</label>
                <select
                  name="balanceGender"
                  value={form.balanceGender}
                  onChange={onChange}
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
                <div className="hint">Best-effort M/F distribution per group.</div>
              </div>

              <div className="formRow">
                <label>Balance by Religion</label>
                <select
                  name="balanceReligion"
                  value={form.balanceReligion}
                  onChange={onChange}
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
                <div className="hint">
                  Best-effort distribution across Buddhism, Tamil, Christianity, Muslim.
                </div>
              </div>

              <div className="formRow">
                <label>Notes</label>
                <div className="note">
                  Gender/Religion balancing are soft goals. GPA & size rules take priority.
                </div>
              </div>
            </div>

            {!isValid && (
              <div className="error">
                Please complete the form correctly (select year, semester & module; check sizes; GPA 0–4 when enabled).
              </div>
            )}

            <div className="actions">
              <button className="btn ghost" onClick={handleResetForm}>
                Reset
              </button>
              <button
                className="btn run"
                onClick={handleGenerate}
                disabled={!isValid || busy.gen}
              >
                {busy.gen ? "Generating…" : "Generate Draft →"}
              </button>
            </div>
          </div>

          {/* Inline Draft Preview */}
          {draftGroups.length > 0 && (
            <div className="card">
              <div className="sectionHeader">
                <h3>Draft Groups (Preview)</h3>
                {summary && (
                  <span className="muted">
                    {summary.totalGroups} group(s) • size {summary.sizeRange?.min}
                    –{summary.sizeRange?.max} (avg {summary.sizeRange?.avg})
                  </span>
                )}
              </div>

              <div className="groupsGrid">
                {draftGroups.map((g, gi) => (
                  <div key={gi} className="groupCard">
                    <div className="groupHeader">
                      <h4>{g.groupName || `Group ${gi + 1}`}</h4>
                      <span className="badge">
                        {g.members?.length || 0} member
                        {(g.members?.length || 0) === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="groupMeta">
                      <span>Year {g.year ?? form.year}</span>
                      <span>Sem {g.semester ?? form.semester}</span>
                      <span>Module {g.moduleCode ?? form.moduleCode}</span>
                    </div>
                    {g.topicName && (
                      <div className="topicRow">
                        <b>Topic:</b> {g.topicId} — {g.topicName}
                      </div>
                    )}
                    <ul className="memberList">
                      {(g.members || []).map((m, mi) => (
                        <li key={mi}>
                          <span className="memberName">{m.name}</span>
                          <span className="memberMeta">
                          ID: {m.studentId}
                          {typeof (m.currentGPA ?? m.GPA) === "number" && ` • GPA ${m.currentGPA ?? m.GPA}`}
                          {m.gender && ` • ${m.gender}`}
                          {m.religion && ` • ${m.religion}`}
                        </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="actions">
                <button
                  className="btn ghost"
                  onClick={() => {
                    setDraftGroups([]);
                    setSummary(null);
                  }}
                >
                  Discard Draft
                </button>
                <button
                  className="btn primary"
                  onClick={handleSave}
                  disabled={busy.save}
                >
                  {busy.save ? "Saving…" : "Confirm & Save"}
                </button>
              </div>
            </div>
          )}

          <div className="card secondary">
            <div className="sectionHeader">
              <h3>What happens next?</h3>
            </div>
            <ul className="bullets">
              <li>We’ll fetch students for the selected Year/Semester.</li>
              <li>We’ll draft groups using round-robin, respecting min/max size and GPA rule.</li>
              <li>Topics will be auto-assigned sequentially/randomly if selected.</li>
              <li>You’ll preview the draft below, then confirm to save as official groups.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
