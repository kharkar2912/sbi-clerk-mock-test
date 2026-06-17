import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DatabaseProvider, useDatabase } from "./context/DatabaseContext";

// View components
import Navbar from "./components/Common/Navbar";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import PracticeMode from "./components/Practice/PracticeMode";
import DailyChallenge from "./components/Practice/DailyChallenge";
import AIImprovement from "./components/Practice/AIImprovement";
import AdminPanel from "./components/Admin/AdminPanel";
import ExamEngine from "./components/Exam/ExamEngine";
import ResultPage from "./components/Result/ResultPage";

function MainApp() {
  const { currentUser, saveTestAttempt } = useAuth();
  const { generateMockTest } = useDatabase();
  
  // View states: 'dashboard', 'practice', 'challenge', 'ai_improvement', 'admin', 'exam', 'result'
  const [view, setView] = useState("dashboard");
  
  // Auth state: 'login', 'register', 'forgot_password'
  const [authView, setAuthView] = useState("login");

  // Exam runtime states
  const [examQuestions, setExamQuestions] = useState([]);
  const [examType, setExamType] = useState("mock");
  const [currentResult, setCurrentResult] = useState(null);

  // Trigger starting a full Mock Test from Dashboard
  const startFullMockTest = () => {
    const questions = generateMockTest();
    if (questions.length === 0) {
      alert("Database error: Question bank is empty. Seed questions first.");
      return;
    }
    setExamQuestions(questions);
    setExamType("mock");
    setView("exam");
  };

  const handleFinishExam = async (resultPayload) => {
    await saveTestAttempt(resultPayload);
    setCurrentResult(resultPayload);
    setView("result");
  };

  // 1. Unauthenticated views
  if (!currentUser) {
    if (authView === "register") {
      return <Register setView={setAuthView} />;
    }
    if (authView === "forgot_password") {
      return <ForgotPassword setView={setAuthView} />;
    }
    return <Login setView={(v) => {
      if (v === "dashboard") {
        setView("dashboard");
        setAuthView("login");
      } else {
        setAuthView(v);
      }
    }} />;
  }

  // 2. Active Exam View (fullscreen, hides Navbar)
  if (view === "exam") {
    return (
      <ExamEngine
        testType={examType}
        questionsList={examQuestions}
        onFinish={handleFinishExam}
        onCancel={() => {
          if (confirm("Are you sure you want to quit the exam? All progress will be lost.")) {
            setView("dashboard");
          }
        }}
      />
    );
  }

  // 3. Post-Exam Scorecard View
  if (view === "result" && currentResult) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar currentView={view} setView={setView} />
        <ResultPage
          result={currentResult}
          onBack={() => {
            setCurrentResult(null);
            setView("dashboard");
          }}
        />
      </div>
    );
  }

  // 4. Authenticated general views
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar currentView={view} setView={setView} />
      
      <main className="pb-16">
        {view === "dashboard" && (
          <Dashboard setView={setView} startTest={startFullMockTest} />
        )}
        {view === "practice" && (
          <PracticeMode setView={setView} />
        )}
        {view === "challenge" && (
          <DailyChallenge setView={setView} />
        )}
        {view === "ai_improvement" && (
          <AIImprovement setView={setView} />
        )}
        {view === "admin" && currentUser.isAdmin && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <MainApp />
      </DatabaseProvider>
    </AuthProvider>
  );
}
