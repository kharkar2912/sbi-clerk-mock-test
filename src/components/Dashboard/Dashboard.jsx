import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, 
  Flame, 
  Play, 
  Compass, 
  Sparkles, 
  Calendar, 
  Clock, 
  Percent, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  BookOpen
} from "lucide-react";
import PerformanceAnalytics from "../Analytics/PerformanceAnalytics";


export default function Dashboard({ setView, startTest }) {
  const { currentUser } = useAuth();
  
  // Format statistics safely
  const stats = currentUser?.stats || {
    totalTestsAttempted: 0,
    bestScore: 0,
    averageScore: 0,
    averageAccuracy: 0,
    averageTimePerQuestion: 0,
    strongestSubject: "N/A",
    weakestSubject: "N/A",
    streak: { current: 0, longest: 0, lastActiveDate: "" },
    achievements: []
  };

  const streakVal = stats.streak?.current || 0;
  const history = currentUser?.testHistory || [];

  // Detail achievements definition
  const achievementDetails = {
    first_test: { name: "Initiator", desc: "Completed first test", color: "from-sky-400 to-blue-500" },
    "5_tests": { name: "Dedicated", desc: "Completed 5 tests", color: "from-purple-400 to-indigo-500" },
    "10_tests": { name: "Pro Gamer", desc: "Completed 10 tests", color: "from-yellow-400 to-orange-500" },
    "50_tests": { name: "Veteran", desc: "Completed 50 tests", color: "from-red-400 to-rose-500" },
    accuracy_90: { name: "Sniper", desc: "Achieved 90%+ accuracy", color: "from-emerald-400 to-teal-500" },
    streak_3: { name: "3-Day Warrior", desc: "Maintained a 3-day streak", color: "from-orange-400 to-red-500" },
    streak_7: { name: "Weekly Scholar", desc: "Maintained a 7-day streak", color: "from-pink-400 to-purple-500" },
    streak_30: { name: "Unstoppable", desc: "Maintained a 30-day streak", color: "from-amber-400 to-yellow-600" }
  };

  // Extract weak topics for the AI suggestion
  // Collect incorrect topics from history
  const getWeakTopicsFromHistory = () => {
    const topicErrors = {};
    history.forEach(attempt => {
      if (attempt.wrongTopics) {
        attempt.wrongTopics.forEach(t => {
          topicErrors[t] = (topicErrors[t] || 0) + 1;
        });
      }
    });
    // Sort and return topics with errors
    return Object.entries(topicErrors)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
  };

  const weakTopics = getWeakTopicsFromHistory();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Welcome & Streaks Headline */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-gradient-to-r from-primary-800 to-primary-950 dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl text-white shadow-lg border border-primary-900/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            SBI Clerk Mock Test Simulator
          </h1>
          <p className="mt-1 text-primary-200 text-sm">
            Welcome back, <span className="font-semibold text-white">{currentUser?.displayName}</span>! Ready to boost your banking exam percentile?
          </p>
        </div>
        
        {/* Streak indicator */}
        <div className="flex items-center gap-3 bg-white/10 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-white/10 backdrop-blur-sm self-stretch md:self-auto justify-center">
          <Flame className={`w-6 h-6 ${streakVal > 0 ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-400"}`} />
          <div className="flex flex-col text-left">
            <span className="text-xs text-primary-200 dark:text-slate-400 leading-none">Practice Streak</span>
            <span className="text-lg font-bold leading-none mt-1">{streakVal} {streakVal === 1 ? "Day" : "Days"}</span>
          </div>
        </div>
      </div>

      {/* Grid: Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-400">Total Attempts</span>
            <span className="text-2xl font-bold text-black dark:text-white mt-1">{stats.totalTestsAttempted}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-400">Best Score</span>
            <span className="text-2xl font-bold text-black dark:text-white mt-1">{stats.bestScore}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-400">Average Accuracy</span>
            <span className="text-2xl font-bold text-black dark:text-white mt-1">{stats.averageAccuracy}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-400">Avg Speed / Q</span>
            <span className="text-2xl font-bold text-black dark:text-white mt-1">{stats.averageTimePerQuestion}s</span>
          </div>
        </div>

      </div>

      {/* Grid: Primary content areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Test Triggers and Weakness Detectors */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Launch Test Panels */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
            <h2 className="text-lg font-bold text-black dark:text-white mb-4">Start Practice Session</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Full Mock Test */}
              <div className="p-5 rounded-xl border border-primary-100 dark:border-primary-950/40 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/20 dark:to-slate-900 flex flex-col justify-between h-48 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900 transition-all">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 rounded">
                      Full Simulation
                    </span>
                    <span className="text-xs text-slate-400 font-medium">120 Mins</span>
                  </div>
                  <h3 className="font-bold text-base text-black dark:text-white mt-3">Full Mock Exam</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                    130 questions generated from bank matching real SBI difficulty profiles.
                  </p>
                </div>
                <button
                  onClick={() => startTest("mock")}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow active:scale-98 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch Exam Simulator</span>
                </button>
              </div>

              {/* Card 2: Custom Practice Sets */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 flex flex-col justify-between h-48 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-black dark:text-slate-300 rounded">
                      Practice Mode
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Custom Timer</span>
                  </div>
                  <h3 className="font-bold text-base text-black dark:text-white mt-3">Custom Practice Mode</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                    Filter questions by section, topic, and difficulty to focus your drills.
                  </p>
                </div>
                <button
                  onClick={() => setView("practice")}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-slate-200 rounded-lg text-sm font-semibold active:scale-98 transition-all border border-slate-300 dark:border-slate-700"
                >
                  <Compass className="w-4 h-4" />
                  <span>Configure Practice Set</span>
                </button>
              </div>

              {/* Card 3: Daily Challenge */}
              <div className="p-5 rounded-xl border border-orange-100 dark:border-orange-950/20 bg-gradient-to-br from-orange-50/30 to-white dark:from-orange-950/10 dark:to-slate-900 flex flex-col justify-between h-48 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded">
                      Daily Challenge
                    </span>
                    <span className="text-xs text-slate-400 font-medium">20 Qs</span>
                  </div>
                  <h3 className="font-bold text-base text-black dark:text-white mt-3">Daily Challenge</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                    Solve a fresh mixed-bag challenge daily to maintain streak rankings.
                  </p>
                </div>
                <button
                  onClick={() => setView("challenge")}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Start Daily Challenge</span>
                </button>
              </div>

              {/* Card 4: AI Weakness Improvement */}
              <div className="p-5 rounded-xl border border-purple-100 dark:border-purple-950/20 bg-gradient-to-br from-purple-50/30 to-white dark:from-purple-950/10 dark:to-slate-900 flex flex-col justify-between h-48 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/30 transition-all">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 rounded">
                      AI Adaptive
                    </span>
                    <span className="text-xs text-slate-400 font-medium">20 Qs</span>
                  </div>
                  <h3 className="font-bold text-base text-black dark:text-white mt-3">AI Improvement Test</h3>
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
                    Auto-generated drill based on your frequently incorrect topics.
                  </p>
                </div>
                <button
                  onClick={() => setView("ai_improvement")}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold active:scale-98 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Improve Weak Topics</span>
                </button>
              </div>

            </div>
          </div>

          {/* Weak Topic Detection Area */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black dark:text-white">Weak Topic Detection</h2>
              <span className="text-[10px] font-semibold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Auto-Analyzer</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Subject Strengths & Weakness */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Strongest Subject</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-semibold text-black dark:text-slate-200">{stats.strongestSubject}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Weakest Subject</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-black dark:text-slate-200">{stats.weakestSubject}</span>
                  </div>
                </div>
              </div>

              {/* Weakest Topics Tags list */}
              <div className="border-l border-slate-200 dark:border-slate-800 pl-6">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block mb-3">
                  Frequently Incorrect Topics
                </span>
                {weakTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {weakTopics.map((topicName, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                      >
                        {topicName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-700 dark:text-slate-400 mt-2">
                    Complete tests to generate weak topic diagnostics.
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: History & Achievements panel */}
        <div className="space-y-8 text-left">
          
          {/* Achievements badge showcase */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-black dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Achievements</span>
            </h2>
            {stats.achievements && stats.achievements.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {stats.achievements.map((achId) => {
                  const detail = achievementDetails[achId];
                  if (!detail) return null;
                  return (
                    <div
                      key={achId}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${detail.color} flex items-center justify-center text-white text-xs font-bold shadow`}>
                        ★
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-black dark:text-slate-200">{detail.name}</span>
                        <span className="text-[10px] text-slate-700 dark:text-slate-400 mt-0.5">{detail.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-400 text-center py-6">
                No achievements unlocked yet. Finish tests and maintain streaks to earn badges!
              </p>
            )}
          </div>

          {/* Test History List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black dark:text-white">Previous Scores</h2>
              {history.length > 0 && (
                <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {history.length} attempts
                </span>
              )}
            </div>

            {history.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {history.map((attempt, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-black dark:text-slate-200 truncate max-w-32">
                        {attempt.type || "Mock Test"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(attempt.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                          {attempt.score.toFixed(1)}
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {attempt.accuracy.toFixed(0)}% acc
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-400 text-center py-10">
                You haven't taken any tests yet.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Performance Analytics Trend Charts */}
      <div className="mt-8">
        <PerformanceAnalytics history={history} />
      </div>

    </div>
  );
}
