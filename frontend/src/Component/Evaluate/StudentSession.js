import React, { useRef, useState } from 'react';
import Peer from 'peerjs';
import { useParams } from 'react-router-dom';
import './VideoSession.css';

function StudentSession() {
  const { sid } = useParams(); // student ID from URL
  const [connected, setConnected] = useState(false);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  const joinSession = async () => {
    const peer = new Peer(sid); // Student ID used as peer ID
    peerRef.current = peer;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (myVideoRef.current) myVideoRef.current.srcObject = stream;

      peer.on('open', () => {
        const instructorPeerId = 'INSTRUCTOR'; // must match instructor
        const call = peer.call(instructorPeerId, stream);

        call.on('stream', remoteStream => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
          setConnected(true);
        });

        // Delay before speaking the welcome message
  setTimeout(() => {
    speakWelcomeMessage(sid);
  }, 2000); // 2-second delay
      });
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      alert("Failed to access camera or microphone.");
    }
  };


  

  return (
    <div className="video-session-container">
      
      <h2>Student Live Session</h2>

      <div className="video-grid">
        <video ref={myVideoRef} autoPlay playsInline muted />
        <video ref={remoteVideoRef} autoPlay playsInline className={connected ? 'connected' : ''} />
      </div>

      <p className={`connection-status ${connected ? '' : 'waiting'}`}>
        {connected ? 'Connected to Instructor ✅' : 'Not connected'}
      </p>

      {!connected && (
        <button onClick={joinSession} className="btn-join">Join Session</button>
      )}


      
    </div>
    
  );
}


// Using Web Speech API to convert text to speech
// Reference: MDN Web Docs – SpeechSynthesis
// https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
// Create speech utterance
  // Reference: MDN Web Docs – SpeechSynthesisUtterance
  // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance

const speakWelcomeMessage = (sid) => {
  const message = `Student ${sid}, this is oslo exam unit, unmute your microphone, remove any unauthorized materials, and welcome to the remote viva session. For the remote viva you will allocated only the manual evaluation marksThis session will be recorded, and it starts now.`;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  utterance.rate = 1; // speed
  utterance.pitch = 1; // tone
  speechSynthesis.speak(utterance);
};

export default StudentSession;
