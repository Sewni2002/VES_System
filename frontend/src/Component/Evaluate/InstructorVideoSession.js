import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useParams } from 'react-router-dom';
import API from '../../api';
import './VideoSession.css';
import INTNav from '../nav/INTnav';

function InstructorVideoSession() {
  const { sid } = useParams();
  const [manualMarks, setManualMarks] = useState('');
  const [student, setStudent] = useState(null);
  const [automatedMarks, setAutomatedMarks] = useState(null);
  const [studentConnected, setStudentConnected] = useState(false);
  const [sessionLink, setSessionLink] = useState('');
  const [sessionEnded, setSessionEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15); // 10 minutes



  


  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  /**
 * Instructor Video Session (Peer-to-Peer)
 *
 * - Uses PeerJS for P2P video/audio communication.
 *   Reference: [1] PeerJS Documentation: https://peerjs.com/docs.html
 *
 * - Relies on WebRTC API for real-time streaming.
 *   Reference: [2] WebRTC API, MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
 */


  // Setup PeerJS
  useEffect(() => {
    const peer = new Peer('INSTRUCTOR'); // Instructor fixed peer ID
    peerRef.current = peer;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        peer.on('call', call => {
          call.answer(stream);
          call.on('stream', remoteStream => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            setStudentConnected(true);
          });
        });
      })
      .catch(err => console.error("Error accessing camera/mic:", err));

    return () => peer.destroy();
  }, []);

  // Fetch student + automated marks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await API.get(`/api/students/by-sid/${sid}`);
        setStudent(studentRes.data);

        const marksRes = await API.get(`/api/automatedmarks/by-sid/${sid}`);
        setAutomatedMarks(marksRes.data);

        const fmRes = await API.get(`/api/fullmarks/by-sid/${sid}`);
        if (fmRes.data?.link) setSessionLink(fmRes.data.link);
      } catch (err) {
        console.error("Error fetching student or marks:", err);
      }
    };
    fetchData();
  }, [sid]);


  useEffect(() => {
  // Only start when component is ready
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);

        // 
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

        // 
        setTimeout(() => {
          const message = `Student ${sid}, your evaluation time is reaching out. Please call the next student.`;
          const speech = new SpeechSynthesisUtterance(message);
          speech.lang = "en-US";
          speech.rate = 1;
          speech.pitch = 1;
          window.speechSynthesis.speak(speech);
        }, 1500);

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [sid]);



  const handleSaveMarks = async () => {
  if (!student || !automatedMarks) {
    return alert("Student or automated marks not loaded yet!");
  }

  // Input validation
  const markValue = manualMarks.trim();
  if (markValue === "") {
    return alert("Please enter manual marks before saving!");
  }

  const numericMark = Number(markValue);
  if (isNaN(numericMark)) {
    return alert("Marks must be a number!");
  }

  if (numericMark < 0 || numericMark > 100) {
    return alert("Marks must be between 0 and 100!");
  }

  try {
    await API.post('/api/fullmarks/save', {
      sid,
      gid: student.gid,
      automatedmarks:
        automatedMarks.easyCount +
        automatedMarks.interCount +
        automatedMarks.advancedCount,
      manualmarks: numericMark,
    });
    alert("Marks saved successfully!");
  } catch (err) {
    console.error("Error saving marks:", err);
    alert("Failed to save marks");
  }
};


  const handleApprove = async () => {
  try {
    const frontendHost = window.location.host; // e.g., localhost:3003
    const res = await API.post(`/api/fullmarks/generate-link/${sid}`, { frontendHost });
    setSessionLink(res.data.link);
  } catch (err) {
    console.error("Error generating link:", err);
  }
};

  const handleDeleteLink = async () => {
    try {
      await API.delete(`/api/fullmarks/delete-link/${sid}`);
      setSessionLink('');
    } catch (err) {
      console.error("Error deleting link:", err);
    }
  };

  const handleShareLink = () => {
    if (sessionLink) {
      navigator.clipboard.writeText(sessionLink);
      alert("Link copied to clipboard! Send it to the student.");
    }
  };

  const handleEndSession = () => {
  if (peerRef.current) {
    peerRef.current.destroy(); // End PeerJS connection
  }
  setSessionEnded(true);
};

  return (

     <>
          <INTNav />
    <div className="video-session-container">
      <h2 style={{fontSize:"1.5rem"}}>Live Video Session with Student {sid}</h2>

      <div className="video-grid">
        <video ref={myVideoRef} autoPlay playsInline muted />
        <video ref={remoteVideoRef} autoPlay playsInline className={studentConnected ? 'connected' : ''} />
      </div>

      <p className={`connection-status ${studentConnected ? '' : 'waiting'}`}>
        {studentConnected ? 'Student connected ✅' : 'Waiting for student...'}
      </p>

      {student && (
        <div className="info-panel">
          <h3>Student Info</h3>
          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Group:</strong> {student.gid}</p>
          <p><strong>Topic:</strong> {student.topic}</p>
        </div>
      )}

      {automatedMarks && (
        <div className="info-panel">
          <h3>Automated Marks</h3>
          <p>Easy: {automatedMarks.easyCount}</p>
          <p>Intermediate: {automatedMarks.interCount}</p>
          <p>Advanced: {automatedMarks.advancedCount}</p>
          <p>Total Auto Marks: {automatedMarks.easyCount + automatedMarks.interCount + automatedMarks.advancedCount}</p>
        </div>
      )}

      <div className="marks-section" style={{marginBottom:"10px"}}>
        <input
          type="number"
          value={manualMarks}
          onChange={e => setManualMarks(e.target.value)}
          placeholder="Enter marks"
        />
        <button  onClick={handleSaveMarks} disabled={!studentConnected}>
          Save Marks
        </button>
      </div>

      <div className="info-panel">
        <h3>Session Link</h3>
        {!sessionLink ? (
          <button onClick={handleApprove}>Approve & Generate Link</button>
        ) : (
          <div>
            <p><strong>Link:</strong> {sessionLink}</p>
            <button onClick={handleShareLink} style={{marginRight:"10px"}}>Share Link</button>
            <button onClick={handleDeleteLink}>Delete Link</button>
          </div>
        )}


        <div style={{ marginTop: '15px' }}>
    <button onClick={handleEndSession} style={{ backgroundColor: '#c0392b' }}>
      End Session
    </button>
    {sessionEnded && <p style={{ marginTop: '10px', color: '#c0392b', fontWeight: 'bold' }}>Session has ended.</p>}
  </div>



      </div>
      
 
    </div>

    <div className="qg-footer">
        &copy; 2025 VES System. All rights reserved.
      </div>
    </>
  );
}

export default InstructorVideoSession;
