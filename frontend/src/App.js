
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import "@fortawesome/fontawesome-free/css/all.min.css";


//chethana
import Home from './Component/Home/Home';
import Dashboard from './Component/Evaluate/Dashboard';
import TodayGroups from './Component/Evaluate/TodayGroups';
import AdminDashboard from './Component/Evaluate/AdminDashboard';
import StudentList from './Component/Evaluate/StudentList';
import InsDashboard from './Component/taskmanage/insDashboard';
import ManualEval from './Component/Evaluate/ManualEval';



import Login from "./Component/Login/Login";
import StudentRegister from "./Component/VivaRegister/Register";
import StudentDashboard from "./Component/StudentDashboard/StudentDashboard";
import InstructorDashboard from "./Component/InstructorDashboard/InstructorDashboard";
import DeanDashboard from "./Component/DeanDashboard/DeanDashboard";
import VivaRegister from "./Component/VivaRegister/VivaRegisterForm";
import PaymentForm from "./Component/VivaRegister/PaymentPage"
import PaymentSuccess from "./Component/VivaRegister/PaymentSuccess";
import ForgotPassword from "./Component/Login/ForgotPassword";
import InstructorVideoSession  from './Component/Evaluate/InstructorVideoSession';
import StudentVideoSession from './Component/Evaluate/StudentSession';
import VivaLineGraph from './Component/Evaluate/VivaLineGraph';


import InstructorRegister from "./Component/Login/InstructorRegister";

import QuizeDashboard from "./Component/ExamManagement/InitialDashboard"; 
import QuestionGeneration from "./Component/ExamManagement/QuestionGeneration"; 
import CodeCheck from "./Component/CodeChecker/codecheck"
import EvaluationStart from "./Component/ExamManagement/EvaluationStart"
import InstrucotorQuizeView from "./Component/ExamManagement/InstructorView"
import StudentQuizView from "./Component/ExamManagement/StudentView"
import ConductEvaluation from "./Component/ExamManagement/ConductEvaluation";
import Check from "./Component/ExamManagement/check";

import AdminDashboardIsi from "./Component/AdminDashboard/adminDashboard";


//AKidnu
import LICDashboard from "./Component/LICDashboard/LICDashboard";
import LICGroups from "./Component/LICDashboard/LICGroups";
import LICDeadlines from "./Component/LICDashboard/LICDeadlines";
import LICDeadlines_View from "./Component/LICDashboard/LICDeadlines_View";
import LICTopics from "./Component/LICDashboard/LICTopics";
import LICScheduler from "./Component/LICDashboard/LICScheduling";
import LICReports from "./Component/LICDashboard/LICReports";
import GroupsList from "./Component/LICDashboard/LICGroups_View"; 
import LICDeanApproval from "./Component/LICDashboard/LICDeanApproval";
import StudentProgress from './Component/Evaluate/StudentProgress';
import VivaDateForm from "./Component/LICDashboard/VivaDateForm";

  
import LICScheduling from "./Component/LICDashboard/LICScheduling";  




//swepa

import ProfilePage from "./Component/StudentDashboard/ProfilePage";
import GrpProfile from "./Component/StudentDashboard/GrpProfile";
import UploadFiles from "./Component/StudentDashboard/UploadFiles";
import MockViva from "./Component/StudentDashboard/MockViva";
import AnnouncementsPage from "./Component/StudentDashboard/AnnouncementsPage";
import FeedbackPage from "./Component/StudentDashboard/FeedbackPage";
import GroupChat from "./Component/StudentDashboard/GroupChat";
import AbsenceForm from "./Component/StudentDashboard/AbsenceForm";



function App() {
  return (
    
    <Routes>



       <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/groups" element={<TodayGroups />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/group/:gid" element={<StudentList />} />
       <Route path="/insDashboard" element={<InsDashboard />} />
       <Route path="/video-session/:sid" element={<InstructorVideoSession />} />
       <Route path="/student-session/:sid" element={<StudentVideoSession />} />
       <Route path="/viva-dashboard" element={<VivaLineGraph />} />
       <Route path="/VivaDateForm" element={<VivaDateForm />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<StudentRegister />} />
      <Route path="/instructordashboard" element={<InstructorDashboard />} />
      <Route path="/licdashboard" element={<LICDashboard />} />
      <Route path="/deandashboard" element={<DeanDashboard />} />
      <Route path="/vivaregister" element={<VivaRegister />} />
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="/ManualEval/:sid" element={<ManualEval />} />

      <Route path="/payment-success" element={<PaymentSuccess />} />
     <Route path="/forgot-password" element={<ForgotPassword />} />
     <Route path="/admindashboardVES" element={<AdminDashboardIsi />} />
     <Route path="/student-progress/:sid" element={<StudentProgress />} />






       <Route path="/instructor-register" element={<InstructorRegister />} />
        <Route path="/quizeDashboard" element={<QuizeDashboard />} /> 

        <Route path="/question-generation" element={<QuestionGeneration />} /> 

        <Route path="/CodeCheck" element={<CodeCheck />} /> 

        <Route path="/evaluation" element={<EvaluationStart />} /> 
        
        <Route path="/instructorQuizView" element={<InstrucotorQuizeView />} /> 
        <Route path="/studentQuizView" element={<StudentQuizView />} /> 
        <Route path="/conductevaluation/:sessionID" element={<ConductEvaluation />} />
        <Route path="/conductevaluation/:instructorID/:sessionID" element={<ConductEvaluation />}/>


  <Route path="/check" element={<Check />} />
      <Route path="/student" element={<StudentQuizView />} />

      <Route path="/manual-evaluation" element={<Dashboard />} />



    {/*vindy*/}

      <Route path="/licScheduling" element={<LICScheduling />} />


{/*Akindu */}

        <Route path="/licdash"  element={<LICDashboard/>}/>
      <Route path="/groupsLIC" element={<LICGroups />} />
      <Route path="/deadlines" element={<LICDeadlines />} />
      <Route path="/deadlines/view" element={<LICDeadlines_View />} />
      <Route path="/topics" element={<LICTopics />} />
      <Route path="/scheduler" element={<LICScheduler />} />
      <Route path="/reports" element={<LICReports />} />  
      <Route path="/groups/list" element={<GroupsList />} />   
      <Route path="/approval" element={<LICDeanApproval />} />  
 {/*SWEPA */}



<Route path="/studentdashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/grp-profile" element={<GrpProfile />} />
      <Route path="/upload" element={<UploadFiles />} />
      <Route path="/mockviva" element={<MockViva />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/groupchat" element={<GroupChat />} />
      <Route path="/absence" element={<AbsenceForm />} />



    </Routes>
  );
}

export default App;
