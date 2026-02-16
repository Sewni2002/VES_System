import React, { useState } from "react";

function CodeCheck() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setQuestions("Generating questions...");

    try {
      const response = await fetch("http://localhost:5000/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setQuestions(data.questions || "No questions returned.");
    } catch (error) {
      console.error("Fetch error:", error);
      setQuestions("Failed to generate questions. Please try again.");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "auto" }}>
      <h2>AI Code-Based Question Generator</h2>
      <form onSubmit={handleSubmit}>
        <label>Select Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="php">PHP</option>
          <option value="javascript">JavaScript</option>
          <option value="c++">C++</option>
        </select>

        <textarea
          rows="10"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here..."
          style={{ width: "100%", padding: "10px" }}
        />

        <button type="submit" style={{ padding: "10px 20px", marginTop: "10px" }}>
          Generate Questions
        </button>
      </form>

      <h3 style={{ marginTop: "30px" }}>Generated Questions:</h3>
      <div
        style={{
          background: "#f0f0f0",
          padding: "15px",
          borderLeft: "4px solid #007bff",
          whiteSpace: "pre-wrap",
        }}
      >
        {questions}
      </div>
    </div>
  );
}

export default CodeCheck;
