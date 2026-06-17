import React, { useState } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { TrendingUp, Award, Zap, Calendar, AlertCircle } from "lucide-react";

export default function PerformanceAnalytics({ history }) {
  const [timeframe, setTimeframe] = useState("30"); // '7', '30', '90'

  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 text-center text-slate-700 dark:text-slate-400">
        <AlertCircle className="w-10 h-10 mx-auto text-slate-700 mb-3" />
        <h3 className="font-bold text-sm text-black dark:text-slate-200">No Analytics Available Yet</h3>
        <p className="text-xs mt-1 max-w-sm mx-auto">
          Complete at least one mock exam or practice set to populate accuracy, speed, and score trend analytics.
        </p>
      </div>
    );
  }

  // Filter and sort history by date
  const sortedHistory = [...history]
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Filter by timeframe days
  const now = Date.now();
  const filteredHistory = sortedHistory.filter(item => {
    const itemDate = new Date(item.date).getTime();
    const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
    return diffDays <= Number(timeframe);
  });

  // Map data for Recharts
  const chartData = filteredHistory.map(item => {
    // Count total answered
    let totalAnswered = 0;
    Object.values(item.sections || {}).forEach(sec => {
      totalAnswered += sec.attempted || 0;
    });

    const speedVal = totalAnswered > 0 
      ? Math.round((item.timeTaken / totalAnswered) * 10) / 10 
      : 0;

    return {
      date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: item.score,
      accuracy: Math.round(item.accuracy),
      speed: speedVal, // avg seconds per question
      type: item.type
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 text-left space-y-6">
      
      {/* Header and timeframe selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5.5 h-5.5 text-primary-600" />
            <span>Performance Trends & Charts</span>
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
            Visualize your score growth, accuracy curves, and pacing speed
          </p>
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: "7", label: "7 Days" },
            { id: "30", label: "30 Days" },
            { id: "90", label: "90 Days" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeframe(item.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === item.id
                  ? "bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm"
                  : "text-slate-700 hover:text-black dark:hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Score Trend */}
          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-black dark:text-slate-300 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-primary-500" />
              <span>Score Progression</span>
            </span>
            <div className="h-48 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    labelClassName="font-bold text-black"
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" name="Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Accuracy Trend */}
          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-black dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              <span>Accuracy Curve (%)</span>
            </span>
            <div className="h-48 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    labelClassName="font-bold text-black"
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} name="Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Speed Trend */}
          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-xs font-bold text-black dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4.5 h-4.5 text-amber-500" />
              <span>Pacing Speed (s/Q)</span>
            </span>
            <div className="h-48 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    labelClassName="font-bold text-black"
                  />
                  <Bar dataKey="speed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Speed (sec/Q)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <p className="text-center text-xs text-slate-700 py-10">
          No attempts recorded within the selected timeframe ({timeframe} days).
        </p>
      )}

    </div>
  );
}
