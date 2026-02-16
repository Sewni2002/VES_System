import React, { useState, useEffect } from "react";
import axios from "axios";

import "./StudentZipSubmissionForm.css";

export default function StudentZipSubmissionForm() {
  const studentID = localStorage.getItem("studentID"); 
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    studentID: studentID || "",
    module: "",
    languageType: "",
  });
  const [submissions, setSubmissions] = useState([]);

  const fetchZips = async () => {
    if (!studentID) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/frontzips/${studentID}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error("Error fetching ZIPs:", err);
    }
  };

  useEffect(() => {
    fetchZips();
  }, [studentID]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a ZIP file");

    const data = new FormData();
    data.append("studentID", studentID);
    data.append("module", formData.module);
    data.append("languageType", formData.languageType);
    data.append("zipFile", file);

    try {
      const res = await axios.post("http://localhost:5000/api/frontzips/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);  // ✅ Use alert instead of message display
      setFile(null);
      setFormData({ studentID, module: "", languageType: "" });
      fetchZips();
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting ZIP"); // ✅ Use alert
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ZIP submission?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/frontzips/${id}`);
      alert(res.data.message);  // ✅ Use alert
      fetchZips();
    } catch (err) {
      alert("Error deleting ZIP"); // ✅ Use alert
    }
  };

  const handleDownload = async (zipFile) => {
    try {
      const res = await fetch(`http://localhost:5000/uploads/zips/${zipFile}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipFile;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error downloading ZIP"); // ✅ Use alert
    }
  };

  return (
    <div className="zip-submission-container_unique_011">
      <h2 className="zip-submission-heading_unique_012">ZIP File Submission</h2>

      <form onSubmit={handleSubmit} className="zip-submission-form_unique_013">
        <input
          type="text"
          name="studentID"
          value={formData.studentID}
          readOnly
          className="zip-submission-input_unique_014"
        />
        <input
          type="text"
          name="module"
          placeholder="Module Code (e.g. IT2030)"
          value={formData.module}
          onChange={handleChange}
          required
          className="zip-submission-input_unique_014"
        />
        <select
          name="languageType"
          value={formData.languageType}
          onChange={handleChange}
          required
          className="zip-submission-select_unique_015"
        >
          <option value="">-- Select Language --</option>
          <option value="Java">Java</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Python">Python</option>
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="C#">C#</option>
          <option value="PHP">PHP</option>
        </select>
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          required
          className="zip-submission-input_unique_014"
        />
        <button type="submit" className="zip-submit-btn_unique_016">Submit ZIP</button>
      </form>

      {submissions.length > 0 && (
        <table className="zip-submissions-table_unique_020">
          <thead>
            <tr>
              <th>Module</th>
              <th>Language</th>
              <th>File</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((zip) => (
              <tr key={zip._id}>
                <td>{zip.module}</td>
                <td>{zip.languageType}</td>
                <td>
                  <button
                    onClick={() => handleDownload(zip.zipFile)}
                    className="zip-download-btn_unique_017"
                  >
                    Download
                  </button>
                </td>
                <td>{new Date(zip.dateSubmit).toLocaleString()}</td>
                <td>
                  <button
                    onClick={() => handleDelete(zip._id)}
                    className="zip-delete-btn_unique_018"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
