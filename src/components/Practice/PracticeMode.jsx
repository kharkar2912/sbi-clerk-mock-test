import React, { useState, useEffect } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { useAuth } from "../../context/AuthContext";
import ExamEngine from "../Exam/ExamEngine";
import ResultPage from "../Result/ResultPage";
import { Compass, Play, BookOpen, Settings, ListChecks, HelpCircle } from "lucide-react";

export default function PracticeMode({ setView }) {
  const { generatePracticeTest, getTopicsBySection } = useDatabase();
  const { saveTestAttempt } = useAuth();

  // Configuration states
  const [section, setSection] = useState("All");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [count, setCount] = useState(20);

  const [topicsList, setTopicsList] = useState([]);
  
  // Runtime states
  const [examQuestions, setExamQuestions] = useState([]);
  const [activeSession, setActiveSession] = useState(false); // true if test running
  const [sessionResult, setSessionResult] = useState(null); // result payload

  // Sync topics list based on selected section
  useEffect(() => {
    const list = getTopicsBySection(section);
    setTopicsList(list);
    setTopic("All"); // Reset topic selection
  }, [section]);

  const handleStartPractice = () => {
    const questions = generatePracticeTest(section, topic, difficulty, count);
    if (questions.length === 0) {
      alert("No questions found matching your filter criteria. Try expanding your selections!");
      return;
    }
    setExamQuestions(questions);
    setActiveSession(true);
    setSessionResult(null);
  };

  const handleFinishExam = async (resultPayload) => {
    // Inject custom type label
    const customResult = {
      ...resultPayload,
      type: `Practice Mode (${section !== "All" ? section : "Mixed"})`
    };
    await saveTestAttempt(customResult);
    setSessionResult(customResult);
    setActiveSession(false);
  };

  if (activeSession) {
    return (
      <ExamEngine
        testType="practice"
        questionsList={examQuestions}
        onFinish={handleFinishExam}
        onCancel={() => {
          if (confirm("Are you sure you want to cancel this practice session? Progress will be lost.")) {
            setActiveSession(false);
          }
        }}
      />
    );
  }

  if (sessionResult) {
    return (
      <ResultPage
        result={sessionResult}
        onBack={() => setSessionResult(null)}
      />
    );
  }

  const sectionsList = [
    "All",
    "English Language",
    "Numerical Ability",
    "Reasoning Ability",
    "General Awareness",
    "Computer Knowledge"
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="p-2.5 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-450 rounded-xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">Custom Practice Mode</h1>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Target specific categories and topics with customized time controls
            </p>
          </div>
        </div>

        {/* Configurations Fields Form */}
        <div className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Exam Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {sectionsList.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Topic / Category
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="All">All Topics ({topicsList.length})</option>
              {topicsList.map((top) => (
                <option key={top} value={top}>{top}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                Questions Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value={10}>10 Questions (10 Mins)</option>
                <option value={20}>20 Questions (20 Mins)</option>
                <option value={30}>30 Questions (30 Mins)</option>
                <option value={50}>50 Questions (50 Mins)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartPractice}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md shadow-primary-500/10 active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Practice Session</span>
          </button>

        </div>

        {/* Feature summary details footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700 dark:text-slate-400">
          <div className="flex gap-2.5 items-start">
            <Settings className="w-4 h-4 text-primary-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-black dark:text-slate-200 block mb-0.5">Custom Controls</span>
              Build quizzes focused exactly on your study checklist.
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <ListChecks className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-black dark:text-slate-200 block mb-0.5">Flexible Timers</span>
              Time scales match question volumes (1 minute per question).
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <HelpCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-black dark:text-slate-200 block mb-0.5">Rich Solutions</span>
              Explanations are displayed instantly upon submission.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
