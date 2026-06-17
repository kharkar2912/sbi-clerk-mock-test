import React, { useState } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { useAuth } from "../../context/AuthContext";
import ExamEngine from "../Exam/ExamEngine";
import ResultPage from "../Result/ResultPage";
import { Calendar, Play, Flame, Trophy, Award, CheckCircle } from "lucide-react";

export default function DailyChallenge({ setView }) {
  const { generateDailyChallenge } = useDatabase();
  const { currentUser, saveTestAttempt } = useAuth();
  
  // Runtime states
  const [examQuestions, setExamQuestions] = useState([]);
  const [activeSession, setActiveSession] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);

  // Check if completed today
  const todayStr = new Date().toISOString().split("T")[0];
  const history = currentUser?.testHistory || [];
  const completedToday = history.some(
    h => h.type === "Daily Challenge" && h.date.split("T")[0] === todayStr
  );

  const handleStartChallenge = () => {
    if (completedToday) {
      alert("You have already completed today's Daily Challenge! Come back tomorrow for a fresh set.");
      return;
    }
    const questions = generateDailyChallenge();
    setExamQuestions(questions);
    setActiveSession(true);
    setSessionResult(null);
  };

  const handleFinishChallenge = async (resultPayload) => {
    const customResult = {
      ...resultPayload,
      type: "Daily Challenge"
    };
    await saveTestAttempt(customResult);
    setSessionResult(customResult);
    setActiveSession(false);
  };

  // Mock Leaderboard details
  const leaderboard = [
    { rank: 1, name: "Ananya Iyer", score: 19.0, time: "12m 45s", avatar: "A" },
    { rank: 2, name: "Vikram Malhotra", score: 17.5, time: "14m 10s", avatar: "V" },
    { rank: 3, name: "currentUser", score: null, time: null, avatar: "U" }, // Placeholder for user
    { rank: 4, name: "Sneha Reddy", score: 16.0, time: "11m 30s", avatar: "S" },
    { rank: 5, name: "Amit Patel", score: 14.5, time: "16m 20s", avatar: "A" }
  ];

  // If user completed today, insert their score in leaderboard
  const todayAttempt = history.find(
    h => h.type === "Daily Challenge" && h.date.split("T")[0] === todayStr
  );
  const userScore = todayAttempt ? todayAttempt.score : 0;
  const userTime = todayAttempt 
    ? `${Math.floor(todayAttempt.timeTaken / 60)}m ${todayAttempt.timeTaken % 60}s` 
    : "-";

  // Sort leaderboard dynamically
  const parsedLeaderboard = leaderboard.map(row => {
    if (row.rank === 3) {
      return {
        ...row,
        name: `${currentUser?.displayName} (You)`,
        score: todayAttempt ? userScore : 0,
        time: todayAttempt ? userTime : "-",
        isUser: true
      };
    }
    return row;
  }).sort((a, b) => b.score - a.score);

  // Re-rank after sorting
  let finalLeaderboard = parsedLeaderboard.map((row, idx) => ({ ...row, rank: idx + 1 }));

  if (activeSession) {
    return (
      <ExamEngine
        testType="challenge"
        questionsList={examQuestions}
        onFinish={handleFinishChallenge}
        onCancel={() => {
          if (confirm("Quit Daily Challenge? Progress will not be saved.")) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-left transition-colors duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Challenge Trigger Card */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="p-2.5 bg-orange-55 shadow-sm border border-orange-100 dark:border-orange-950/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black dark:text-white">Daily 20 Challenge</h1>
                <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
                  Test your skills with a daily mixed-section sprint and climb the ranks
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-orange-50/20 dark:bg-slate-950/25 p-5 rounded-2xl border border-orange-100/30 dark:border-slate-800/40">
                <div className="flex items-center gap-3 flex-1">
                  <Flame className="w-10 h-10 text-orange-500 fill-orange-500 animate-pulse" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-slate-700 dark:text-slate-400">Daily Challenge Streak</span>
                    <span className="text-base font-extrabold text-black dark:text-slate-100 mt-0.5">
                      {currentUser?.stats?.streak?.current || 0} consecutive days active
                    </span>
                  </div>
                </div>

                {completedToday ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 text-xs font-bold self-center">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed Today</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-450 text-xs font-bold self-center">
                    <span>Pending for Today</span>
                  </span>
                )}
              </div>

              {/* Challenge Details Grid */}
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
                  <span className="text-[10px] text-slate-700 uppercase font-bold tracking-wide">Topic Scope</span>
                  <span className="block text-lg font-bold text-black dark:text-white mt-1 truncate">Mixed</span>
                </div>
              </div>

              <button
                onClick={handleStartChallenge}
                disabled={completedToday}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white shadow-md active:scale-98 transition-all ${
                  completedToday 
                    ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-700 shadow-none" 
                    : "bg-orange-500 hover:bg-orange-655 shadow-orange-500/10"
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{completedToday ? "Already Taken Today" : "Launch Daily Challenge"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Leaderboard Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 text-left">
          <h2 className="text-lg font-bold text-black dark:text-white mb-1.5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Leaderboard</span>
          </h2>
          <span className="text-[10px] text-slate-700 dark:text-slate-400 block mb-5 uppercase font-semibold">Today's Standings</span>
          
          <div className="space-y-3">
            {finalLeaderboard.map((row) => (
              <div
                key={row.rank}
                className={`flex justify-between items-center p-3 rounded-xl border ${
                  row.isUser
                    ? "border-orange-200 bg-orange-50/15 dark:border-orange-950/40 dark:bg-orange-950/10"
                    : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <span className={`w-5 text-xs font-bold text-center ${
                    row.rank === 1 ? "text-yellow-500" : row.rank === 2 ? "text-slate-400" : "text-slate-700"
                  }`}>
                    #{row.rank}
                  </span>
                  
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase ${
                    row.isUser 
                      ? "bg-orange-100 text-orange-700" 
                      : "bg-primary-100 text-primary-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {row.avatar}
                  </div>
                  
                  <div className="flex flex-col text-left">
                    <span className={`text-xs font-semibold ${row.isUser ? "text-orange-700 dark:text-orange-400 font-bold" : "text-black dark:text-slate-200"}`}>
                      {row.name}
                    </span>
                    <span className="text-[9px] text-slate-700 mt-0.5">
                      Time: {row.time}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold ${row.isUser ? "text-orange-700 dark:text-orange-400" : "text-slate-800 dark:text-slate-300"}`}>
                  {row.score.toFixed(1)} / 20
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
            <Award className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>Scores are evaluated based on correct answers and submission speeds. Challenges lock at midnight.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
