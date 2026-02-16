// app.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const OpenAI = require("openai");
const axios = require('axios');
const path = require("path");

require("dotenv").config();

// --- Express App Setup ---
const app = express();
const PORT = 5000;

//--app.use(cors({
 // origin: "http://localhost:3000",
  //methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  //allowedHeaders: ["Content-Type"],
 // credentials: true,
//}));



app.use(cors());

// Additional headers to ensure proper communication
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Accept JSON payloads up to 50MB
app.use(express.json({ limit: "50mb" }));

// Accept URL-encoded payloads up to 50MB
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Routes ---
const studentRouter = require('./Route/students');
const groupRouter = require('./Route/groups');
const schedulerRoutes = require('./Route/scheduler');
const unavailabilityRoutes = require('./Route/unavailability');
const authRoutes = require("./Route/authRoutes");
const instructorRoute = require("./Route/instructorRoute");
const licRoute = require("./Route/licRoute");
const questionRoutes = require("./Route/questionRoutes");
const deanRoute = require("./Route/deanRoute");
const evaluateVivaSessionRoute = require("./Route/evaluateVivaSession");
const InstructorAllocation = require("./Route/tempinstructorallocation");
const studentVivaSessionRoutes = require("./Route/studentvivasession");
const VivaSessionRoute = require("./Route/tempvivasession");
const studentRoute = require("./Route/studentRoute");
const vivaRegisterRoute = require("./Route/vivaRegisterRoute");
const directPayRoute = require("./Route/directPayRoute");
const otpRoute = require("./Route/otpRoute");
const studentSubmissionRoute = require("./Route/studentSubmissionRoute");
const resetPasswordRoutes = require("./Route/resetPasswordRoute");
const FindStudentsForGrouo = require("./Route/evaluateVivaStudentList");

const attendanceRouter = require('./Route/attendance');


// Use Routes
app.use('/students', studentRouter);
app.use('/api/groups', groupRouter);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/unavailability', unavailabilityRoutes);
app.use("/api", authRoutes);
app.use("/api/instructors", instructorRoute);
app.use("/api/lic", licRoute);
app.use("/api/questions", questionRoutes);
app.use("/api/deans", deanRoute);
app.use("/api", evaluateVivaSessionRoute);
app.use("/api", InstructorAllocation);
app.use("/api", studentVivaSessionRoutes);
app.use("/api", VivaSessionRoute);
app.use("/api", studentRoute);
app.use("/api/viva", vivaRegisterRoute);
app.use("/api/directpay", directPayRoute);
app.use("/api/otp", otpRoute);
app.use("/api/studentSubmission", studentSubmissionRoute);
app.use("/api/reset", resetPasswordRoutes);
app.use("/api/", FindStudentsForGrouo);

app.use("/api/attendance", attendanceRouter);

const fullMarksRouter = require('./Route/fullmarks');
app.use('/api/fullmarks', fullMarksRouter);

const automatedMarkRoute1 = require("./Route/automatedMarkRouteIS");
app.use("/api/automatedmark", automatedMarkRoute1);
const statisticsRouter = require('./Route/statistics');
app.use('/api/statistics', statisticsRouter);

const automatedMarksRoute = require('./Route/automatedMarksRoute');

app.use("/api/automatedmarks", automatedMarksRoute);

const adminRoutesAdd = require("./Route/adminAdding");
app.use("/api/adminadding", adminRoutesAdd);

const adminRoutes = require("./Route/adminRoute");
app.use("/api/admin", adminRoutes);

const licRoutesAdminadding = require("./Route/addingLICAdmin");
app.use("/api/licadminadding", licRoutesAdminadding);

const deanRoutesAdminadding = require("./Route/addingDeanAdmin");
app.use("/api/deanadminadding", deanRoutesAdminadding);


const adminReports = require("./Route/adminReports");
app.use("/api/admin/reports/", adminReports);

const smsRoutes = require('./Route/smsRoutes');

app.use('/api/sms', smsRoutes);

//Akindu Routes
const deadlineRoutes = require("./Route/LICDeadlineRoutes");
const instructionRoutes = require("./Route/LICInstructionRoutes");
const markAllocationRoutes = require("./Route/LICMarkAllocationRoutes");
const topicRoutes = require("./Route/LICTopicRoute");
const groupRoutes = require("./Route/LICGroupRoute");
const licProfileManageRoute = require("./Route/licProfileManageRoute");
const announcementRoute = require("./Route/announcementRoute");
app.use("/api", announcementRoute);

//new 
const moduleRoutes = require("./Route/LICModuleRoute");
app.use("/api/modules", moduleRoutes);
const licGroupRoutes = require("./Route/LICgroupingstaticsAK");
app.use("/api/licgroupsakindu", licGroupRoutes);
const zipRoutes = require("./Route/studentzipdownloadlic");
app.use("/api/zip-submissionsakindu", zipRoutes);


app.use("/api/groups", groupRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/instructions", instructionRoutes);
app.use("/api/mark-allocations", markAllocationRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/licprofilemanage", licProfileManageRoute);
app.use("/uploadslicimage", express.static("uploads")); // serve profile images

//vindy
const schedulerRoutesVD  =require('./Route/schedulerRoutes');
const hallRoutes = require('./Route/hallRoutes');
const studentAvailabilityRoutes = require('./Route/studentAvailabilityRoutes');

app.use('/api/schedulerVD', schedulerRoutesVD);
app.use('/api/halls', hallRoutes);
app.use('/api/student-availability', studentAvailabilityRoutes);


const schedulercountvindy = require("./Route/schedulecountvindy");
app.use("/api/schedulercountvindy", schedulercountvindy);


const schedulerRoutescoviva = require("./Route/concludeVIVAroute");
app.use("/api/schedulerconviva", schedulerRoutescoviva);


const instructorannouncement = require("./Route/instructionannouncementdisplay");
app.use("/api/instructionsgetannouncements", instructorannouncement);

//SWEPA
const SPstudentRouter = require('./Route/SPstudents');
const SPstudentRoute = require('./Route/SPstudentRoute');
const SPgroupRouter = require('./Route/SPgroups');
const SPstudentGroupRoutes = require("./Route/SPstudentGroup"); 
const SPsubmissionRoutes = require("./Route/SPsubmissionRoutes");
const SPmockVivaRoutes = require("./Route/SPmockVivaRoutes");
const SPchecklistRoutes = require("./Route/SPchecklistRoutes");
const SPannouncementRoutes = require("./Route/SPAnnouncementRoutes");
const SPfeedbackRoutes = require("./Route/SPfeedbackRoutes");
const SPchat = require("./Route/SPchat");
const SPautomatedMarksRoute = require("./Route/SPautomatedMarksRoute");
const SPabsenceRoute = require("./Route/SPabsenceRoute");
const SPvivaSchedulerRoutes = require('./Route/SPvivaSchedulerRoutes');
const SPfullmarksRoute = require("./Route/SPfullmarksRoute");

const studentSubmissionRoutesswpa = require("./Route/spSubmissionnew");

app.use("/api/frontstudentSubmission", studentSubmissionRoutesswpa);


const zipSubmissionRoutesswpa = require("./Route/zipSubmissionRoutes");
app.use("/api/frontzips", zipSubmissionRoutesswpa);


const offenceFeedbackRoutes = require("./Route/offenceFeedbackRoutes");
app.use("/api/offence-feedback", offenceFeedbackRoutes);
app.use("/uploads/offences", express.static("/uploads/offences")); // serve audio files




app.use('/api/SPstudents', SPstudentRouter);
app.use('/api/SPstudentRoute', SPstudentRoute);
app.use('/api/SPgroups', SPgroupRouter);
app.use("/api/SPstudentGroup", SPstudentGroupRoutes);
app.use("/api/SPsubmissions", SPsubmissionRoutes);
// serve uploaded files (so frontend can download using the relative storagePath like "uploads/123-file.zip")
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/SPmockviva", SPmockVivaRoutes);
app.use("/api/SPchecklist", SPchecklistRoutes);
app.use("/api/SPannouncements", SPannouncementRoutes);
app.use("/api/SPfeedback", SPfeedbackRoutes);
app.use("/api/SPchat", SPchat);
app.use("/api/SPautomatedmarks", SPautomatedMarksRoute);
app.use("/api/SPabsence", SPabsenceRoute);
app.use('/api/SPviva-scheduler', SPvivaSchedulerRoutes);
app.use("/api/SPfullmarks", SPfullmarksRoute);
app.use('/studentimages', express.static(path.join(__dirname, 'studentimages')));



/**
 * Generates programming questions from a given code snippet using OpenAI's GPT models.
 *
 * This function receives code and language details from the client, constructs a prompt
 * for the OpenAI API, and requests either multiple-choice or open-ended questions. 
 * It parses the AI response and returns it in structured JSON format or raw text depending on the endpoint.
 *
 * Features:
 * - Accepts a code snippet and programming language as input.
 * - Can generate multiple-choice questions for Easy, Intermediate, and Advanced levels (GPT-4 route).
 * - Can generate 3 insightful questions (multiple-choice or open-ended) for understanding the code (GPT-3.5 route).
 * - Handles JSON parsing of AI responses safely.
 * - Returns structured question data or raw AI output.
 *
 * Parameters:
 * @param {string} code              - The code snippet to analyze.
 * @param {string} language          - The programming language of the code (e.g., "JavaScript", "Python").
 * @param {number} [questionsPerLevel] - Optional. Number of questions per difficulty level (GPT-4 endpoint only).
 *
 * Returns:
 * @returns {Promise<Object>} JSON response:
 *   - GPT-4 endpoint example:
 *     {
 *       "Easy": [{"question": "Question text", "options": ["A","B","C","D","E"], "correct": "A"}],
 *       "Intermediate": [...],
 *       "Advanced": [...]
 *     }
 *   - GPT-3.5 endpoint example:
 *     { "questions": "Raw AI-generated questions text" }
 *
 * Error Handling:
 * - Returns 400 if required fields (code, language) are missing.
 * - Returns 500 if the AI API request fails or JSON parsing fails.
 *
 * References:
 * - OpenAI API Documentation: https://platform.openai.com/docs/api-reference
 * - Chat Completions API: https://platform.openai.com/docs/guides/chat
 */

//  OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//  MongoDB route
//app.use("/Users", route);
//const studentRoute = require("./Route/studentRoute");
app.use("/api/students", studentRoute);

const vivaSummaryRoutes = require("./Route/vivaSummaryRoutes");

// Body parser middleware
app.use(express.json());

app.use("/api/vivasummary", vivaSummaryRoutes);




// Body parser middleware
app.use(express.json());



const markAllocationRoutess = require("./Route/markallocation");
app.use("/api/markallocation", markAllocationRoutess);

// Question generation route

app.post("/generate-questions", async (req, res) => {
  const { code, language, questionsPerLevel } = req.body;

  try {
    const prompt = `
You are an expert programming tutor. Analyze the following ${language} code:

${code}

Generate ${questionsPerLevel} multiple-choice questions for each difficulty level: Easy, Intermediate, Advanced.
- Each question should be specific to the code.
- Include **5 options labeled A-E**.
- Specify the **correct answer** for each question.
- Return the output strictly in this JSON format, no extra text:

{
  "Easy": [
    {"question": "Question text", "options": ["", "", "", "", ""], "correct": "A"}
  ],
  "Intermediate": [...],
  "Advanced": [...]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    // GPT returns text, parse JSON safely
    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content);
    } catch (jsonError) {
      console.error(" JSON parse error:", jsonError);
      console.log("GPT raw output:", completion.choices[0].message.content);
      return res.status(500).json({ error: "Failed to parse AI response as JSON." });
    }

    res.json(aiResponse);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate AI questions." });
  }
});



// Question generation route Chethana
app.post("/api/generate-questions", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const prompt = `You are an expert programming tutor. Based on the following ${language} code, generate 3 insightful questions (multiple-choice or open-ended) that test understanding of the code:\n\n${code}\n\nQuestions:\n`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful tutor who creates programming questions." },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    res.json({ questions: result });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});



// Weather route chethana
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city || 'Colombo'; // default city
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    // 5-day forecast (3-hour intervals)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(weatherUrl),
      axios.get(forecastUrl)
    ]);

    res.json({
      current: currentRes.data,
      forecast: forecastRes.data
    });
  } catch (err) {
    console.error("Weather API error:", err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});



/**
 * Summarizes a given code snippet using OpenAI's GPT-3.5-turbo model.
 *
 * This endpoint accepts a code snippet and its programming language, 
 * and returns a concise, human-readable summary highlighting:
 * - Purpose of the code
 * - Logic flow
 * - Key concepts
 * 
 * The summary is generated without rewriting the full code.
 *
 * Parameters:
 * @param {string} code      - The code snippet to summarize.
 * @param {string} language  - Programming language of the code (e.g., "Python", "JavaScript").
 *
 * Returns:
 * @returns {Promise<Object>} JSON response:
 *   { "summary": "Concise summary of the code" }
 *
 * Error Handling:
 * - Returns 400 if code or language is missing in the request.
 * - Returns 500 if the OpenAI API request fails.
 *
 * Logging:
 * - Prints the generated summary to the server console for debugging.
 *
 * References:
 * - OpenAI Chat Completions API: https://platform.openai.com/docs/guides/chat
 * - GPT-3.5-turbo model: https://platform.openai.com/docs/models/gpt-3-5
 */


app.post("/summarize-code", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required" });
  }

  const prompt = `You are an expert programming tutor. Please provide a clear, concise summary of what the following ${language} code does. 
Highlight the purpose, logic, and key concepts without rewriting the full code.

Code:
${code}

Summary:`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful tutor who summarizes student code." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });

    const summary = completion.choices[0].message.content;
    console.log("Summary generated:", summary); // <-- add this
    res.json({ summary });
  } catch (error) {
    console.error("OpenAI API error (summary):", error);
    res.status(500).json({ error: "Failed to summarize code" });
  }
});




/**
 * Socket.IO Real-Time Evaluation System
 *
 * This module handles real-time communication between students and instructors
 * during code evaluations using Socket.IO over an HTTP server.
 *
 * Features:
 * - Connection management and logging of connected/disconnected users.
 * - ID broadcasting: Receives a student or session ID and emits it to all clients.
 * - Evaluation start: Notifies all clients when an evaluation session begins.
 * - Temporary caching of student questions:
 *     - Stores questions in-memory until the student confirms submission.
 *     - Emits cached questions to all clients for live monitoring.
 * - Student confirmation:
 *     - Sends cached questions directly to the specific student's room.
 *     - Broadcasts student confirmation to instructors.
 * - Question navigation:
 *     - Updates clients in real-time when a student changes question index.
 * - Student answers:
 *     - Broadcasts answers to all connected clients for real-time tracking.
 * - Finish attempt:
 *     - Notifies all clients when a student completes their attempt.
 * - Room management:
 *     - Allows students to join their private room for receiving individual data.
 *
 * Temporary Storage:
 * - `pendingQuestions` is used as an in-memory cache to store questions per student.
 *   (For production, consider using a persistent store like Redis or a database.)
 *
 * Events:
 * @event 'sendId'             - Receives a student/session ID from a client and broadcasts it.
 * @event 'startEvaluation'    - Notifies all clients that an evaluation has started.
 * @event 'cacheStudentQuestions' - Stores student questions temporarily and broadcasts them.
 * @event 'studentConfirmed'   - Sends cached questions to the specific student and notifies instructors.
 * @event 'questionIndexChanged' - Updates all clients when a student navigates to a new question.
 * @event 'studentAnswer'      - Broadcasts a student's answer to all clients.
 * @event 'finishAttempt'      - Notifies clients that a student has finished their attempt.
 * @event 'joinStudentRoom'    - Adds a student socket to their private room.
 *
 * Socket.IO Reference:
 * - Socket.IO Docs: https://socket.io/docs/v4/
 * - Rooms & Namespaces: https://socket.io/docs/v4/rooms/
 *
 * Notes:
 * - All logs use console for debugging purposes.
 * - `io.emit` broadcasts to all clients, `socket.broadcast.emit` excludes sender.
 * - `io.to(room).emit` sends messages to a specific room.
 */


// --- HTTP + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});

let pendingQuestions = {}; // temporary in-memory store

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendId", (id) => {
    console.log("Received ID:", id);
    io.emit("receiveId", id);
  });

  socket.on("startEvaluation", (data) => {
    console.log(" Received start:", data);
    io.emit("evaluationStarted", data); // broadcast to all clients
  });

  //  Store questions temporarily before student confirms
socket.on("cacheStudentQuestions", ({ studentID, groupID, questions }) => {
    // Cache questions temporarily
    pendingQuestions[studentID] = questions;
  console.log(` Cached questions for ${studentID} in group ${groupID}`);
    // 🔹 Immediately emit to all clients (so Check.js receives)
  io.emit("cacheStudentQuestions", { studentID, groupID, questions });
  });

  //  When student confirms, deliver cached questions
socket.on("studentConfirmed", ({ groupID, studentID }) => {
  console.log(`Student confirmed: ${studentID} from group ${groupID}`);

  const studentQuestions = pendingQuestions[studentID] || [];

  // Emit ONLY to the specific student's room
  io.to(studentID).emit("studentQuestions", { questions: studentQuestions });

  // Broadcast confirmation to instructor/conductEvaluation
  socket.broadcast.emit("studentConfirmed", { groupID, studentID });
});


socket.on("questionIndexChanged", ({ studentID, newIndex }) => {
  console.log(` Question index update for ${studentID}: ${newIndex}`);

  // Emit to everyone (instructor + student’s room)
  io.emit("questionIndexChanged", { studentID, newIndex });
});

  socket.on("studentAnswer", ({ studentID, questionId, answer }) => {
    console.log(` Answer from ${studentID}: Q${questionId} -> ${answer}`);

    // Broadcast to all connected clients (instructors, etc.)
    io.emit("studentAnswer", { studentID, questionId, answer });
  });



  socket.on("finishAttempt", ({ studentID }) => {
    console.log(` Student finished attempt: ${studentID}`);
    io.emit("finishAttempt", { studentID });
  });



  socket.on("joinStudentRoom", (studentID) => {
    console.log(`Student ${studentID} joined their room`);
    socket.join(studentID);
  });

  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});





// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" Connected to MongoDB");
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error("MongoDB connection failed:", err));



  // === DEBUG ROUTES FOR STUDENT AVAILABILITY ===

// Test if collection works
app.post('/api/test-availability', async (req, res) => {
  try {
    const StudentAvailability = require('./Model/StudentAvailability');
    
    const testData = {
      groupId: "TEST-GROUP",
      groupName: "Test Group",
      weekStartDate: new Date('2024-01-01'),
      availability: [{
        day: "Monday",
        timeSlots: [{
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true
        }]
      }]
    };

    const result = await StudentAvailability.create(testData);
    console.log("✅ Test save successful:", result._id);
    res.json({ success: true, data: result });
    
  } catch (error) {
    console.error("❌ Test save failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Check specific time slot
app.post('/api/debug-check-availability', async (req, res) => {
  try {
    const { groupId, date, startTime, endTime } = req.body;
    
    const StudentAvailability = require('./Model/StudentAvailability');
    const scheduleDate = new Date(date);
    const dayOfWeek = scheduleDate.getDay();
    const weekStart = new Date(scheduleDate);
    weekStart.setDate(scheduleDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    const availability = await StudentAvailability.findOne({
      groupId,
      weekStartDate: weekStart
    });

    console.log("🔍 Debug availability check:", {
      groupId,
      date,
      startTime,
      endTime,
      found: !!availability,
      weekStart
    });

    res.json({ 
      success: true,
      availability,
      weekStart: weekStart.toISOString()
    });
    
  } catch (error) {
    console.error("❌ Debug check failed:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});