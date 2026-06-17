import React, { useState } from "react";
import { 
  Trophy, 
  Percent, 
  Clock, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen
} from "lucide-react";

export default function ResultPage({ result, onBack }) {
  const [filter, setFilter] = useState("all"); // 'all', 'correct', 'incorrect', 'unattempted'
  const [expandedSolutions, setExpandedSolutions] = useState({});

  const toggleSolution = (idx) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Stats calculation
  const totalQs = result.answers.length;
  const attempted = result.answers.filter(a => a.selectedAnswer !== null).length;
  const unattempted = totalQs - attempted;
  const correct = result.answers.filter(a => a.selectedAnswer !== null && a.isCorrect).length;
  const incorrect = attempted - correct;
  const timeTakenMin = Math.floor(result.timeTaken / 60);
  const timeTakenSec = result.timeRemaining !== undefined ? result.timeRemaining % 60 : result.timeTaken % 60;

  // Filter solutions list
  const filteredAnswers = result.answers.filter((ans, idx) => {
    if (filter === "all") return true;
    if (filter === "correct") return ans.selectedAnswer !== null && ans.isCorrect;
    if (filter === "incorrect") return ans.selectedAnswer !== null && !ans.isCorrect;
    if (filter === "unattempted") return ans.selectedAnswer === null;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200 text-left">
      
      {/* Return Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-slate-300 rounded-xl transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>

      {/* 1. Score Summary Dashboard */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-8">
        <h1 className="text-xl font-bold text-black dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Trophy className="w-5.5 h-5.5 text-yellow-500" />
          <span>Exam Performance Scorecard</span>
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary-200 block">Final Score</span>
            <span className="text-3xl font-extrabold block mt-1.5">{result.score.toFixed(1)}</span>
            <span className="text-[10px] text-primary-100 mt-2 block">out of {totalQs} marks</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">Accuracy Rate</span>
            <span className="text-3xl font-extrabold block mt-1.5">{result.accuracy.toFixed(1)}%</span>
            <span className="text-[10px] text-emerald-100 mt-2 block">on attempted questions</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500 text-white shadow">
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-100 block">Time Taken</span>
            <span className="text-3xl font-extrabold block mt-1.5">
              {timeTakenMin}m {timeTakenSec}s
            </span>
            <span className="text-[10px] text-indigo-100 mt-2 block">allocated: {totalQs === 130 ? "120" : "20"} mins</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-300 shadow">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Questions</span>
            <span className="text-3xl font-extrabold text-black dark:text-white block mt-1.5">{totalQs}</span>
            <span className="text-[10px] text-slate-400 mt-2 block">
              {attempted} Attempted | {unattempted} Unattempted
            </span>
          </div>

        </div>

        {/* Incorrect vs Correct Grid counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs font-semibold">
          <div className="flex items-center gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-900/30">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Correct Answers: {correct}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-500 border border-red-100 dark:border-red-900/30">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <span>Incorrect Answers: {incorrect}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            <span>Unattempted: {unattempted}</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-primary-50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span>Speed: {attempted > 0 ? (result.timeTaken / attempted).toFixed(1) : 0}s / Q</span>
          </div>
        </div>

      </div>

      {/* 2. Section-wise metrics table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-8 overflow-hidden">
        <h2 className="text-lg font-bold text-black dark:text-white mb-4">Section-wise Analysis</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-black dark:text-slate-300">
                <th className="py-3 px-4">Section Name</th>
                <th className="py-3 px-4 text-center">Attempted</th>
                <th className="py-3 px-4 text-center">Correct</th>
                <th className="py-3 px-4 text-center">Wrong</th>
                <th className="py-3 px-4 text-center">Accuracy (%)</th>
                <th className="py-3 px-4 text-right">Time Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.entries(result.sections || {}).map(([secName, sec]) => {
                const acc = sec.attempted > 0 ? (sec.correct / sec.attempted) * 100 : 0;
                const min = Math.floor(sec.timeSpent / 60);
                const secSpent = sec.timeSpent % 60;
                return (
                  <tr key={secName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-semibold text-black dark:text-slate-300">{secName}</td>
                    <td className="py-3.5 px-4 text-center">{sec.attempted}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{sec.correct}</td>
                    <td className="py-3.5 px-4 text-center text-red-500 dark:text-red-400">{sec.wrong}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-black dark:text-slate-300">{acc.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs">{min}m {secSpent}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Detailed solutions viewing */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-primary-500" />
            <span>Detailed Solutions & Key</span>
          </h2>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Questions" },
              { id: "correct", label: "Correct" },
              { id: "incorrect", label: "Incorrect" },
              { id: "unattempted", label: "Unattempted" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                  filter === btn.id
                    ? "bg-primary-600 border-primary-600 text-white shadow"
                    : "border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Solutions List */}
        {filteredAnswers.length > 0 ? (
          <div className="space-y-4">
            {filteredAnswers.map((ans, index) => {
              const globalIdx = result.answers.findIndex(a => a.id === ans.id);
              const isExpanded = !!expandedSolutions[ans.id];
              
              // Colors
              let statusBorder = "border-slate-200 dark:border-slate-800";
              let badgeColor = "bg-slate-100 text-black dark:bg-slate-800 dark:text-slate-300";
              let badgeLabel = "Unattempted";
              
              if (ans.selectedAnswer !== null) {
                if (ans.isCorrect) {
                  statusBorder = "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/5 dark:bg-emerald-950/5";
                  badgeColor = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
                  badgeLabel = "Correct";
                } else {
                  statusBorder = "border-red-200 dark:border-red-900/40 bg-red-50/5 dark:bg-red-950/5";
                  badgeColor = "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400";
                  badgeLabel = "Incorrect";
                }
              }

              return (
                <div
                  key={ans.id}
                  className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${statusBorder}`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleSolution(ans.id)}
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                      <span className="text-xs font-bold text-black dark:text-slate-200">
                        Question {globalIdx + 1}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-wide">
                          {ans.section}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ans.topic}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                      
                      <span className="text-[10px] text-slate-400 font-mono">
                        Time: {ans.timeSpent}s
                      </span>
                      
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Solution Detail */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 text-left space-y-4">
                      
                      <div className="text-black dark:text-slate-100 text-sm font-medium leading-relaxed whitespace-pre-line border-b border-slate-100 dark:border-slate-800 pb-4">
                        {ans.question}
                      </div>

                      {/* Options listing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {[
                          { label: "A", text: ans.optionA },
                          { label: "B", text: ans.optionB },
                          { label: "C", text: ans.optionC },
                          { label: "D", text: ans.optionD }
                        ].map((opt) => {
                          const isCorrectOpt = ans.correctAnswer === opt.label;
                          const isSelectedOpt = ans.selectedAnswer === opt.label;

                          let optBorder = "border-slate-200 dark:border-slate-800";
                          let optBg = "bg-white dark:bg-slate-900";
                          let optText = "text-black dark:text-slate-300";

                          if (isCorrectOpt) {
                            optBorder = "border-emerald-500";
                            optBg = "bg-emerald-50 dark:bg-emerald-950/35";
                            optText = "text-emerald-800 dark:text-emerald-300 font-bold";
                          } else if (isSelectedOpt && !ans.isCorrect) {
                            optBorder = "border-red-500";
                            optBg = "bg-red-50 dark:bg-red-950/35";
                            optText = "text-red-800 dark:text-red-300 font-bold";
                          }

                          return (
                            <div
                              key={opt.label}
                              className={`p-3 border rounded-xl flex items-center justify-between ${optBorder} ${optBg} ${optText}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{opt.label}.</span>
                                <span>{opt.text}</span>
                              </div>
                              
                              {isCorrectOpt && <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Correct Key</span>}
                              {isSelectedOpt && !ans.isCorrect && <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">Your Choice</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="mt-4 p-4 rounded-xl bg-primary-50/20 dark:bg-slate-800/40 border border-primary-100/30 dark:border-slate-800 text-xs">
                        <span className="font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider block mb-2">
                          Step-by-Step Explanation
                        </span>
                        <p className="text-black dark:text-slate-300 leading-relaxed whitespace-pre-line">
                          {ans.explanation}
                        </p>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-400 text-center py-8">
            No questions match the selected filter.
          </p>
        )}
      </div>

    </div>
  );
}
