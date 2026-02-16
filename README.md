# 🎓 Viva Evaluation System (VES)

The **Viva Evaluation System (VES)** is a full-stack web-based academic management platform developed as a group project at SLIIT.

The system streamlines viva examination management, automates grading workflows, tracks student performance, and enables structured communication between students and academic staff.

The application is built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** and follows a modular, role-based architecture.

---

## 🚀 Key Features

### 👩‍🎓 Student Features

- Secure Login & Dashboard Access  
- Personal Profile View & Edit  
- Group Profile View for Allocated Viva Groups  
- Team Chat (Restricted access to allocated group members only)  
- Large File Sharing within Group Chat  
- Announcement Panel (Instructor-published notices)  
- Viva Calendar (React Calendar integration)  
- Viva Preparation Checklist (Interactive To-Do System)  
- Graphical Progress Visualization  
- Progress Report Generation with Automated Feedback  
- System Feedback Form  
- Absence Request Submission  
- Mock Viva Practice Quiz with Instant Feedback  
- Question Upload Page (ZIP & Text Files for Viva Question Generation)  

### 👨‍🏫 Instructor / Admin Features

- Online Viva Scheduling & Management  
- Manual & Automated Evaluation Tools  
- Performance Analytics Dashboard  
- PDF Report Generation  
- Role-Based Access Control  
- Secure Payment Integration for Viva Registration  
- WhatsApp & Email Notification APIs  
- Voice Synthesis API Integration  

---

## 🏗️ System Architecture

The system follows a full-stack MERN architecture:

- **React.js** – Frontend UI & Dashboard Components  
- **Node.js & Express.js** – Backend API & Business Logic  
- **MongoDB** – Database Management  
- **REST APIs** – Communication between frontend & backend  
- **JWT-based Authentication** – Secure role-based access  

---

## 📊 Technologies Used

- MongoDB  
- Express.js  
- React.js  
- Node.js  
- Recharts (Analytics Visualization)  
- React Calendar  
- PDF Generation Library  
- WhatsApp & Email Notification APIs  
- Voice Synthesis API  
- Git & GitHub  

---

## 👨‍💻 My Contribution – Student Dashboard Module

I was responsible for designing and implementing the **Student Dashboard Module**, focusing on structured data handling, interactive features, secure backend integration, and collaborative functionalities.

### 🔹 Student Profile Management

- Implemented profile viewing and editing functionality  
- Managed student data across multiple academic semester collections  

### 🔹 Viva Group Collaboration System

- Developed a dynamic Team Chat System  
- Restricted access to allocated group members only  
- Enabled real-time group communication  
- Implemented large file sharing functionality  
- Added backend validation to enforce role-based group visibility  

### 🔹 Announcement Panel

- Implemented dynamic announcement display system  
- Developed backend controllers to fetch latest and all announcements  

### 🔹 Viva Calendar

- Integrated React Calendar component  
- Displayed viva date, time, and venue information  
- Connected scheduled viva data from backend  

### 🔹 Viva Preparation Checklist

- Built an interactive to-do system  
- Enabled task completion tracking  
- Added graphical progress visualization  
- Generated automated performance summary reports with feedback  

### 🔹 Mock Viva Practice Test

- Designed and implemented a Mock Viva Quiz Module  
- Included static practice questions for student preparation  
- Implemented immediate result evaluation  
- Provided instant feedback after submission  
- Enhanced student confidence and self-assessment before the actual viva  

### 🔹 Question Upload Module

- Developed a file upload page  
- Supported ZIP and text file uploads  
- Integrated with the question generation module developed by another team member  
- Implemented backend validation and secure file handling  

### 🔹 Feedback & Absence Request System

- Developed student feedback submission form  
- Implemented absence request form with backend storage  
- Integrated API-based form handling and validation  

---

## 🧱 CRUD Operations Implemented (Student Module)

- **Create** – Feedback submission, Absence request  
- **Read** – Profile data, Group details, Announcements, Viva schedule  
- **Update** – Profile editing, Task completion tracking  
- **Delete** – Chat-related features  

---

## 🚀 Getting Started

Follow these steps to run the system locally.

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-link>
cd VES_System_Github
```

---

### 2️⃣ Install Dependencies

Open the project in VS Code.

#### 📌 Backend Setup

```bash
cd Backend
npm install
npm start
```

#### 📌 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm start
```

---

### 3️⃣ Run the Application

Once both backend and frontend servers are running:

- Backend runs on: http://localhost:5000  
- Frontend runs on: http://localhost:3000  

You can now access the system in your browser.

---

## 📅 Project Duration

July 2025 – September 2025

