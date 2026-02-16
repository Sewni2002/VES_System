import React, { useState } from "react";

function VivaDateForm() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setError("Both start date and end date are required.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/vivasummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) throw new Error("Failed to save viva dates");

      const data = await response.json();
      setSuccess(`Viva scheduled from ${data.startDate.slice(0, 10)} to ${data.endDate.slice(0, 10)}`);
      setStartDate("");
      setEndDate("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="viva-form-container"  >
      <h3>Schedule Viva deadlines</h3>
      <form onSubmit={handleSubmit} className="viva-form" >
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            style={{width:"95%"}}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
                        style={{width:"95%"}}

            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}
        <button type="submit">Save Viva Dates</button>
      </form>
    </div>
  );
}

export default VivaDateForm;
