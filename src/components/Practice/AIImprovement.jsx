import React, { useState } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { useAuth } from "../../context/AuthContext";
import ExamEngine from "../Exam/ExamEngine";
import ResultPage from "../Result/ResultPage";
import { Sparkles, Play, Target, Award, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AIImprovement({ setView }) {
  const { generateAIImprovementTest } = useDatabase();
  const { currentUser, saveTestAttempt } = useAuth();

  // Runtime states
  const [examQuestions, setExamQuestions] = useState([]);
  const [activeSession, setActiveSession] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  // Extract weak topics
  const history = currentUser?.testHistory || [];

  const getWeakTopics = () => {
    const errors = {};
    history.forEach(attempt => {
      if (attempt.wrongTopics) {
        attempt.wrongTopics.forEach(t => {
          errors[t] = (errors[t] || 0) + 1;
        });
      }
    });
    return Object.entries(errors)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
  };

  const weakTopics = getWeakTopics();

  const handleStartImprovement = () => {
    const questions = generateAIImprovementTest(weakTopics);
    if (questions.length === 0) {
      alert("No questions found in the question bank. Try uploading more questions in the Admin panel!");
      return;
    }
    setExamQuestions(questions);
    setActiveSession(true);
    setSessionResult(null);
  };

  const handleFinishImprovement = async (resultPayload) => {
    const customResult = {
      ...resultPayload,
      type: "AI Improvement Test"
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
        onFinish={handleFinishImprovement}
        onCancel={() => {
          if (confirm("Cancel AI Improvement test? Progress will be lost.")) {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-left transition-colors duration-200">
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black dark:text-white">AI Adaptive Improvement</h1>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Personalized practice tests targeting your high-error topics
            </p>
          </div>
        </div>

        {/* Diagnostic Status Box */}
        {weakTopics.length > 0 ? (
          <div className="space-y-6">
            
            {/* Alert banner details */}
            <div className="flex items-start gap-3 bg-purple-50/25 dark:bg-purple-950/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 text-xs">
              <Target className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-purple-950 dark:text-purple-305">Diagnostic Analysis Active</span>
                <p className="text-slate-800 dark:text-slate-400">
                  Our system analyzed your recent tests and detected <strong>{weakTopics.length} weak areas</strong>. 
                  Taking this AI Improvement session will generate a custom 20-question challenge containing topics where you made mistakes.
                </p>
              </div>
            </div>

            {/* List of Weak Topics with icon badges */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-3">
                Detected Improvement Topics
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weakTopics.map((topicName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-red-100 dark:border-red-950/30 bg-red-50/10 dark:bg-red-950/5 text-left"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-bold text-black dark:text-slate-200">{topicName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Details Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-700 uppercase font-bold tracking-wide">Questions</span>
                <span className="block text-lg font-bold text-black dark:text-white mt-1">20 Qs</span>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-700 uppercase font-bold tracking-wide">Time Limit</span>
                <span className="block text-lg font-bold text-black dark:text-white mt-1">20 Mins</span>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-700 uppercase font-bold tracking-wide">Evaluation</span>
                <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-450 mt-1">Adaptive</span>
              </div>
            </div>

            <button
              onClick={handleStartImprovement}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-purple-650 hover:bg-purple-700 shadow-md shadow-purple-500/10 active:scale-98 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Generate Adaptive Practice Set</span>
            </button>

          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Target className="w-8 h-8" />
            </div>
            
            <h3 className="text-base font-bold text-black dark:text-white">No Weak Topics Detected Yet</h3>
            
            <p className="text-xs text-slate-700 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Diagnostic profiles are generated when you answer questions incorrectly in Mock Exams or Practice Mode. 
              Take a few tests first to let our analytics system trace your accuracy!
            </p>

            <button
              onClick={() => setView("dashboard")}
              className="mt-6 inline-flex items-center justify-center gap-1.5 py-2.5 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-primary-500/15"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* How it works info segment */}
        {weakTopics.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 mt-8 pt-6">
            <h4 className="text-xs font-bold text-black dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span>How AI Improvement Works</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed">
              Our analyzer tracks error history over all attempts. Topics with error rates greater than 40% are classified as priority focus points. Custom improvement tests deliver concentrated repetitions on these specific topics, aiding in retention and mastery.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
