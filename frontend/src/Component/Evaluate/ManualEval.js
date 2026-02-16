import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode'; 
import INTNav from '../nav/INTnav';
import './ManualEval.css';
import OffenceFeedback from './OffenceFeedback';   

function ManualEval() {
  const { sid } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [group, setGroup] = useState(null);
  const [automatedMarks, setAutomatedMarks] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submission, setSubmission] = useState(null); // store student code
  const [manualMarks, setManualMarks] = useState(""); // input manual marks
  const [generatedQR, setGeneratedQR] = useState(null);
  const [markAllocation, setMarkAllocation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15); // 10 minutes = 600 seconds
  
const [submissionError, setSubmissionError] = useState(false);



  useEffect(() => {
   
    const fetchData = async () => {
      try {
        // Get student info
        const studentRes = await fetch(`http://localhost:5000/api/students/by-sid/${sid}`);
        if (!studentRes.ok) throw new Error('Failed to fetch student');
        const studentData = await studentRes.json();
        setStudent(studentData);

        // Get group info
        if (studentData?.gid) {
          const groupRes = await fetch(`http://localhost:5000/api/groups/by-gid/${studentData.gid}`);
          if (!groupRes.ok) throw new Error('Failed to fetch group');
          setGroup(await groupRes.json());
        }

        // Get automated marks
        const marksRes = await fetch(`http://localhost:5000/api/automatedmarks/by-sid/${sid}`);
        if (!marksRes.ok) throw new Error('Failed to fetch marks');
        const marksData = await marksRes.json();
        setAutomatedMarks(marksData);

        // 4Get attendance if attempted
        if (marksData?.attempt) {
          const attendanceRes = await fetch(`http://localhost:5000/api/attendance/by-sid/${sid}`);
          if (!attendanceRes.ok) throw new Error('Failed to fetch attendance');
          const attendanceData = await attendanceRes.json();
          setAttendanceStatus(attendanceData?.status || 'Present');
        }

        // 5Get student code submission////////added new
         // 5Fetch student submission/code
   try {
  // Fetch student submission/code
  const submissionRes = await fetch(`http://localhost:5000/api/studentSubmission/${sid}`);

  if (!submissionRes.ok) {
    // Instead of throwing, show overlay
    setSubmissionError(true);
  } else {
    const submissionData = await submissionRes.json();
    setSubmission(submissionData);
  }

} catch (err) {
  console.error('Error fetching submission:', err);
  setSubmissionError(true); // fallback in case fetch itself fails
}

        // Get mark allocation (for year 1)
      const allocationRes = await fetch("http://localhost:5000/api/markallocation/year/1");
      if (!allocationRes.ok) throw new Error('Failed to fetch mark allocation');
      const allocationData = await allocationRes.json();
      setMarkAllocation(allocationData);


        // All data fetched
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }


      
    };

    fetchData();
  }, [sid]);

useEffect(() => {
  if (loading) return; // Start timer only after data loads

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);

        // soft bell tone
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = "sine"; 
        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2); 

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1.2);

        
       setTimeout(() => {
  // Format SID to read digit by digit (e.g., "1 0 1")
  const formattedSID = sid.toString().split('').join(' ');
  const message = `Student ${formattedSID}, the evaluation time is reaching out. Please call the next student.`;

  const speech = new SpeechSynthesisUtterance(message);
  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();

    // Try to find Microsoft David or fallback
    const david = voices.find(v => v.name.includes("Microsoft David"));
    const googleUS = voices.find(v => v.name.includes("Google US English"));

    speech.voice = david || googleUS || voices[0];
    window.speechSynthesis.speak(speech);
  };

  // If voices not yet loaded, wait for them
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
  } else {
    setVoiceAndSpeak();
  }
}, 1500);

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [loading, sid]);






  const handleAttendanceChange = async (status) => {
    try {
      const res = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: sid, status }),
      });
      if (!res.ok) throw new Error('Failed to mark attendance');
      setAttendanceStatus(status);
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };


 

   
const handleSaveMarks = async () => {
  if (!manualMarks || Number(manualMarks) < 0) {
    alert("Enter a valid marks value");
    return;
  }

  try {
  // --- Calculate automated marks based on weights ---
    const easyCount = automatedMarks.easyCount || 0;
    const interCount = automatedMarks.interCount || 0;
    const advancedCount = automatedMarks.advancedCount || 0;

    const easyWeight = markAllocation?.criteria.find(c => c.name === "Easy Question")?.weight || 0;
    const interWeight = markAllocation?.criteria.find(c => c.name === "Intermediate Level Question")?.weight || 0;
    const hardWeight = markAllocation?.criteria.find(c => c.name === "Hard Question")?.weight || 0;

    // Example: total 100 marks * weight%
    const totalAuto =
      (easyCount * easyWeight / 100) +
      (interCount * interWeight / 100) +
      (advancedCount * hardWeight / 100);

    // Save marks
    const saveRes = await fetch("http://localhost:5000/api/fullmarks/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sid: submission.studentID,
        gid: submission.groupID,
        automatedmarks: totalAuto,
        manualmarks: Number(manualMarks),
      }),
    });

    const savedData = await saveRes.json();

    // Generate student progress link
    const frontendHost = window.location.host;
    const resultLink = `http://${frontendHost}/student-progress/${submission.studentID}`;

    // Generate QR code as base64
    const qrCodeData = await QRCode.toDataURL(resultLink);

    // Save resultLink and qrCode in backend
await fetch(`http://localhost:5000/api/fullmarks/save-result/${submission.studentID}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ resultLink, qrCode: qrCodeData }),
});

//Save QR code to display immediately
setGeneratedQR(qrCodeData);

alert("Manual marks saved and QR code generated!");
  } catch (err) {
    console.error(err);
    alert("Failed to save marks or generate QR code");
  }
};







  if (loading) return <p>Loading evaluation data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <INTNav />
      <div className="manual-eval-container">
       
        <h1>Manual Student Wise Evaluation</h1>

       <div className="info-sections-row">
  {student && (
    <div className="student-info">
      <h3>Student Info</h3>
      <p><strong>SID:</strong> {student.idNumber}</p>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Group ID:</strong> {student.gid || 'N/A'}</p>
    </div>
  )}

  {group && (
    <div className="group-info">
      <h3>Group Info</h3>
      <p><strong>Group ID:</strong> {group.gid}</p>
      <p><strong>Members:</strong> {group.members?.join(', ') || 'N/A'}</p>
    </div>
  )}

  {automatedMarks && (
    <div className="automated-marks">
      <h3>Automated Marks</h3>
      <p><strong>Easy:</strong> {automatedMarks.easyCount}</p>
      <p><strong>Intermediate:</strong> {automatedMarks.interCount}</p>
      <p><strong>Advanced:</strong> {automatedMarks.advancedCount}</p>
      <p>
        <strong>Total:</strong>{" "}
        {automatedMarks.easyCount + automatedMarks.interCount + automatedMarks.advancedCount}
      </p>
    </div>
  )}

  {markAllocation && (
    <div className="criteria-info">
      <h3>Mark Allocation</h3>
      {markAllocation.criteria.map((c) => (
        <p key={c.name}>
          <strong>{c.name}:</strong> {c.weight}%
        </p>
      ))}
    </div>
  )}
</div>




        {/* Student Code Submission */}
        {submission && (
  <div className="submission-section">
    <h3>Submitted Code</h3>
    <pre style={{ padding: "1rem", overflowX: "auto" }}>
      {submission.code || "No code submitted"}
    </pre>

    <div style={{ marginTop: "1rem" }}>
      <input
        type="number"
        value={manualMarks}
        onChange={(e) => setManualMarks(e.target.value)}
        placeholder="Enter manual marks"
      />
     <button onClick={handleSaveMarks} style={{ marginLeft: "1rem" }}>
  Save Marks
</button>

    </div>
  </div>
)}








{generatedQR && (
  <div style={{ marginTop: "1rem" }}>
    <h4>Student Progress QR Code:</h4>
    <img src={generatedQR} alt="QR Code" style={{ width: "150px", height: "150px" }} />
    <p>Scan this QR code to view progress</p>
  </div>
)}





{submissionError && (
  <div className="submission-error-overlay">
    <div className="submission-error-box">
      <h2>No Submission Found</h2>
      <p>This student hasn't submitted any code yet.</p>
      <button onClick={() => navigate(-1)}>Try Another Student</button>
    </div>
  </div>
)}





        {/* Remote Request section (only for remote students) */}
        {automatedMarks?.remotereq && (
          <div className="remote-request">
            <p>
              <strong>Remote Request:</strong> {automatedMarks.remotereq}{" "}
              <button
                className="approve-btn"
                style={{  color: "white" , marginLeft:"5px"}}
                onClick={() => navigate(`/video-session/${sid}`)}
              >
                Approve Request
              </button>
            </p>
            
            
          </div>
        
        )}




{submission && (
  <div className="offence-feedback-wrapper" style={{ marginTop: "2rem" }}>
    <OffenceFeedback prefilledStudentId={submission.studentID} />
  </div>
)}


        <div className="attendance-section">
          <h3>Attendance</h3>
          {automatedMarks?.attempt ? (
            <p>Marked Present</p>
          ) : (
            <div className="attendance-buttons">
              <button onClick={() => handleAttendanceChange('Present')}>Present</button>
              <button onClick={() => handleAttendanceChange('Late')}>Late</button>
              <button onClick={() => handleAttendanceChange('Absent')}>Absent</button>
              <button onClick={() => handleAttendanceChange('Remote')}>Remote</button>
            </div>
          )}
          <p><strong>Current Status:</strong> {attendanceStatus || 'Not marked'}</p>
        </div>
          <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
      </div>
    </>
  );
}

export default ManualEval;
