import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  AlertTriangle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Maximize2, 
  Minimize2, 
  Info
} from "lucide-react";

export default function ExamEngine({ testType, questionsList, onFinish, onCancel }) {
  const { currentUser } = useAuth();
  
  // Total questions in this test session
  const totalQs = questionsList.length;

  // Active question index state
  const [currentIdx, setCurrentIdx] = useState(0);

  // User responses mapping: { [questionId/Index]: selectedOption }
  const [responses, setResponses] = useState({});

  // Palette status states mapping: 
  // 'not-visited', 'not-answered', 'answered', 'marked-review', 'answered-marked'
  const [paletteStates, setPaletteStates] = useState(
    Array(totalQs).fill("not-visited").map((val, idx) => idx === 0 ? "not-answered" : val)
  );

  // Time tracking states: remaining seconds
  const initialDuration = testType === "mock" ? 120 * 60 : 20 * 60; // 120 Mins for mock, 20 mins for practice/daily/AI
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarning, setShowWarning] = useState(""); // Warning messages for timer
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Reference for container to handle fullscreen
  const containerRef = useRef(null);
  
  // Track time spent per question: { [questionIndex]: seconds }
  const [timeSpentPerQ, setTimeSpentPerQ] = useState(Array(totalQs).fill(0));

  // 1. Auto-save responses state to LocalStorage (every 5 seconds)
  useEffect(() => {
    const backupData = {
      testType,
      questionsList,
      responses,
      paletteStates,
      timeRemaining,
      timeSpentPerQ,
      currentIdx,
      timestamp: Date.now()
    };
    localStorage.setItem("sbi_clerk_exam_backup", JSON.stringify(backupData));
  }, [responses, paletteStates, timeRemaining, currentIdx, timeSpentPerQ]);

  // 2. Load backup if available (insulates against crashes)
  useEffect(() => {
    const storedBackup = localStorage.getItem("sbi_clerk_exam_backup");
    if (storedBackup) {
      try {
        const backup = JSON.parse(storedBackup);
        // Ensure the backup is for the same questions list and not too old (within 2 hours)
        if (
          backup.questionsList && 
          backup.questionsList.length === totalQs && 
          backup.questionsList[0].id === questionsList[0].id &&
          Date.now() - backup.timestamp < 2 * 60 * 60 * 1000
        ) {
          setResponses(backup.responses || {});
          setPaletteStates(backup.paletteStates || []);
          setTimeRemaining(backup.timeRemaining || initialDuration);
          setTimeSpentPerQ(backup.timeSpentPerQ || Array(totalQs).fill(0));
          setCurrentIdx(backup.currentIdx || 0);
          console.log("Recovered exam session from automatic local backup.");
        }
      } catch (err) {
        console.error("Failed to restore backup:", err);
      }
    }
  }, []);

  // 3. Countdown timer tick and alarm warnings
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit at zero
          return 0;
        }

        // Warnings at 30, 10, 5, 1 minute
        const mins = Math.floor((prev - 1) / 60);
        const secs = (prev - 1) % 60;
        
        if (mins === 30 && secs === 0) triggerTimeWarning("30 minutes");
        else if (mins === 10 && secs === 0) triggerTimeWarning("10 minutes");
        else if (mins === 5 && secs === 0) triggerTimeWarning("5 minutes");
        else if (mins === 1 && secs === 0) triggerTimeWarning("1 minute");

        return prev - 1;
      });

      // Track time spent on the current active question
      setTimeSpentPerQ((prevSpent) => {
        const copy = [...prevSpent];
        copy[currentIdx] = (copy[currentIdx] || 0) + 1;
        return copy;
      });

    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx]);

  // 4. Reload prevention handlers
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Warning: Navigating away or reloading will risk losing your progress on this exam.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const triggerTimeWarning = (period) => {
    setShowWarning(`Attention: Only ${period} remaining! Manage your pace.`);
    setTimeout(() => setShowWarning(""), 6000);
  };

  // Fullscreen toggle helpers
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen to fullscreen changes outside standard triggers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Map questions list to section bounds
  const getSectionsInfo = () => {
    const info = {};
    questionsList.forEach((q, idx) => {
      if (!info[q.section]) {
        info[q.section] = { startIdx: idx, endIdx: idx, count: 0 };
      }
      info[q.section].endIdx = idx;
      info[q.section].count += 1;
    });
    return info;
  };

  const sectionsInfo = getSectionsInfo();

  // Jump to specific question
  const navigateToQuestion = (idx) => {
    if (idx < 0 || idx >= totalQs) return;
    
    // Update old active state if not visited/answered
    setPaletteStates((prev) => {
      const copy = [...prev];
      // If the old question had no response and wasn't marked, it is 'not-answered' (Red)
      if (copy[currentIdx] === "not-visited" || copy[currentIdx] === "not-answered") {
        copy[currentIdx] = responses[currentIdx] ? "answered" : "not-answered";
      }
      
      // If jumping to next and it was not visited, set it to not-answered (Red)
      if (copy[idx] === "not-visited") {
        copy[idx] = "not-answered";
      }
      return copy;
    });

    setCurrentIdx(idx);
  };

  // Jump to first question of a section
  const handleSectionTab = (sectionName) => {
    const sec = sectionsInfo[sectionName];
    if (sec) {
      navigateToQuestion(sec.startIdx);
    }
  };

  // Button Action: Save & Next
  const handleSaveNext = () => {
    const hasAnswer = responses[currentIdx] !== undefined;

    setPaletteStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = hasAnswer ? "answered" : "not-answered";
      return copy;
    });

    if (currentIdx < totalQs - 1) {
      navigateToQuestion(currentIdx + 1);
    }
  };

  // Button Action: Mark for Review & Next
  const handleMarkReviewNext = () => {
    const hasAnswer = responses[currentIdx] !== undefined;

    setPaletteStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = hasAnswer ? "answered-marked-review" : "marked-review";
      return copy;
    });

    if (currentIdx < totalQs - 1) {
      navigateToQuestion(currentIdx + 1);
    }
  };

  // Button Action: Clear Response
  const handleClearResponse = () => {
    setResponses((prev) => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });

    setPaletteStates((prev) => {
      const copy = [...prev];
      copy[currentIdx] = "not-answered";
      return copy;
    });
  };

  // Select option value
  const handleSelectOption = (optLabel) => {
    setResponses((prev) => ({
      ...prev,
      [currentIdx]: optLabel
    }));
  };

  // Complete exam submit
  const handleSubmit = (force = false) => {
    if (!force && !showSubmitModal) {
      setShowSubmitModal(true);
      return;
    }

    // Clean backup
    localStorage.removeItem("sbi_clerk_exam_backup");

    // Math metrics
    let correct = 0;
    let wrong = 0;
    let attempted = 0;
    const sectionBreakdown = {};

    // Initialize breakdown
    Object.keys(sectionsInfo).forEach(secName => {
      sectionBreakdown[secName] = { attempted: 0, correct: 0, wrong: 0, timeSpent: 0 };
    });

    questionsList.forEach((q, idx) => {
      const ans = responses[idx];
      const timeSpent = timeSpentPerQ[idx] || 0;
      
      // Accumulate time spent in its section
      if (sectionBreakdown[q.section]) {
        sectionBreakdown[q.section].timeSpent += timeSpent;
      }

      if (ans !== undefined) {
        attempted += 1;
        if (sectionBreakdown[q.section]) {
          sectionBreakdown[q.section].attempted += 1;
        }

        if (ans === q.correctAnswer) {
          correct += 1;
          if (sectionBreakdown[q.section]) {
            sectionBreakdown[q.section].correct += 1;
          }
        } else {
          wrong += 1;
          if (sectionBreakdown[q.section]) {
            sectionBreakdown[q.section].wrong += 1;
          }
        }
      }
    });

    // Score: +1.0 for Correct, -0.25 negative marks for Incorrect
    const rawScore = (correct * 1.0) - (wrong * 0.25);
    const finalScore = Math.round(Math.max(0, rawScore) * 10) / 10;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
    const timeTaken = initialDuration - timeRemaining;

    // Collect topics that were incorrect
    const wrongTopics = [];
    questionsList.forEach((q, idx) => {
      const ans = responses[idx];
      if (ans !== undefined && ans !== q.correctAnswer) {
        if (!wrongTopics.includes(q.topic)) {
          wrongTopics.push(q.topic);
        }
      }
    });

    const attemptResult = {
      testId: "attempt_" + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      type: testType === "mock" ? "Mock Test" : testType === "challenge" ? "Daily Challenge" : "Practice Mode",
      score: finalScore,
      accuracy,
      timeTaken,
      sections: sectionBreakdown,
      wrongTopics,
      // Map complete questions and answers to show in Detailed Review
      answers: questionsList.map((q, idx) => ({
        id: q.id,
        section: q.section,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        selectedAnswer: responses[idx] || null,
        isCorrect: responses[idx] === q.correctAnswer,
        timeSpent: timeSpentPerQ[idx] || 0
      }))
    };

    onFinish(attemptResult);
  };

  // Helper formats
  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeQ = questionsList[currentIdx];
  const activeSection = activeQ?.section;

  // Render question statistics for confirmation modal
  const getSubmitSummaryStats = () => {
    let answered = 0;
    let notAnswered = 0;
    let markedReview = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    paletteStates.forEach(state => {
      if (state === "answered") answered++;
      else if (state === "not-answered") notAnswered++;
      else if (state === "marked-review") markedReview++;
      else if (state === "answered-marked-review") answeredMarked++;
      else if (state === "not-visited") notVisited++;
    });

    return { answered, notAnswered, markedReview, answeredMarked, notVisited };
  };

  const summaryStats = getSubmitSummaryStats();

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#eef2f5] dark:bg-slate-950 flex flex-col font-sans select-none text-black dark:text-slate-100 transition-colors"
      id="exam-interface-fullscreen-container"
    >
      
      {/* 1. TCS iON styled Top Bar */}
      <div className="bg-primary-900 text-white px-4 py-2.5 flex justify-between items-center border-b border-primary-950 shadow-md">
        <div className="flex items-center gap-3">
          <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
            {testType === "mock" ? "SBI Clerk Prelims Mock" : "Practice Mock Set"}
          </span>
          <span className="text-sm font-light text-primary-200">
            Candidate: <span className="font-semibold text-white">{currentUser?.displayName}</span>
          </span>
        </div>

        {/* Warning notification banner */}
        {showWarning && (
          <div className="hidden lg:flex items-center gap-2 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1.5 rounded animate-warning-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>{showWarning}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-primary-950/60 border border-primary-800 px-3.5 py-1.5 rounded-lg">
            <span className="text-[10px] text-primary-300 uppercase font-semibold">Time Left:</span>
            <span className="font-mono text-sm font-bold tracking-wider text-amber-300">
              {formatTime(timeRemaining)}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-primary-950/40 hover:bg-primary-950/80 rounded border border-primary-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Warning Banner for Mobile/General */}
      {showWarning && (
        <div className="lg:hidden bg-amber-500 text-slate-950 text-xs font-bold text-center py-2 px-4">
          {showWarning}
        </div>
      )}

      {/* 2. Section Tabs (Horizontal row of active categories) */}
      <div className="bg-[#cbdce6] dark:bg-slate-900 border-b border-[#aabdc9] dark:border-slate-800 flex flex-wrap gap-1 px-4 py-1">
        {Object.keys(sectionsInfo).map((secName) => {
          const isActive = activeSection === secName;
          const details = sectionsInfo[secName];
          return (
            <button
              key={secName}
              onClick={() => handleSectionTab(secName)}
              className={`px-4 py-2 text-xs font-bold border transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-300 border-b-transparent border-[#aabdc9] dark:border-slate-700 shadow-sm"
                  : "bg-[#e2edf3] dark:bg-slate-800 hover:bg-white/40 dark:hover:bg-slate-800 text-black dark:text-slate-400 border-transparent"
              }`}
            >
              {secName} ({details.count})
            </button>
          );
        })}
      </div>

      {/* 3. Main Split View: Question Area & Navigation Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: Question display and selections */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto border-r border-[#cbdce6] dark:border-slate-800">
          
          {/* Question Title Bar */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 px-6 py-3 flex justify-between items-center">
            <span className="text-xs font-bold text-primary-800 dark:text-primary-500">
              Question No. {currentIdx + 1} of {totalQs}
            </span>
            <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">
              Difficulty: {activeQ?.difficulty} | Topic: {activeQ?.topic}
            </span>
          </div>

          {/* Question Text & Math */}
          <div className="flex-1 p-6 md:p-8 text-left space-y-6">
            <div className="text-black dark:text-slate-100 font-medium leading-relaxed text-sm whitespace-pre-line border-b border-slate-100 dark:border-slate-800/60 pb-6">
              {activeQ?.question}
            </div>

            {/* Option Radio grid */}
            <div className="space-y-3 pt-2">
              {[
                { label: "A", text: activeQ?.optionA },
                { label: "B", text: activeQ?.optionB },
                { label: "C", text: activeQ?.optionC },
                { label: "D", text: activeQ?.optionD }
              ].map((opt) => {
                const isSelected = responses[currentIdx] === opt.label;
                return (
                  <div
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all ${
                      isSelected 
                        ? "border-primary-500 bg-primary-50/30 dark:border-primary-600 dark:bg-primary-950/20" 
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "border-primary-500 text-primary-600 dark:border-primary-400"
                        : "border-slate-300 dark:border-slate-700"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-600 dark:bg-primary-400" />}
                    </div>
                    
                    <div className="text-xs text-black dark:text-slate-300 font-medium">
                      <span className="font-bold text-black dark:text-slate-200 mr-1.5">{opt.label}.</span>
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FOOTER BAR: NAVIGATION ACTIONS */}
          <div className="bg-[#cbdce6] dark:bg-slate-900 border-t border-[#aabdc9] dark:border-slate-800 p-3 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleClearResponse}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-black dark:text-slate-200 text-xs font-semibold rounded shadow-sm"
              >
                Clear Response
              </button>
              <button
                onClick={handleMarkReviewNext}
                className="px-4 py-2 bg-[#f0ad4e] hover:bg-[#ec971f] text-slate-950 text-xs font-semibold rounded shadow-sm border border-[#eea236]"
              >
                Mark for Review & Next
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigateToQuestion(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-black dark:text-slate-200 text-xs font-semibold rounded shadow-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={handleSaveNext}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded shadow-sm border border-primary-700"
              >
                Save & Next
              </button>
            </div>

            <button
              onClick={() => handleSubmit(false)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow border border-emerald-700"
            >
              Submit Test
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: PALETTE NAVIGATION GRID */}
        <div className="w-full md:w-80 bg-[#e2edf3] dark:bg-slate-900/60 border-l border-[#cbdce6] dark:border-slate-800 flex flex-col overflow-y-auto">
          
          {/* Candidate Profile Details Box */}
          <div className="bg-white dark:bg-slate-900 border-b border-[#cbdce6] dark:border-slate-800 p-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-primary-700 dark:text-primary-300 text-lg font-bold shadow-inner">
              {currentUser.displayName ? currentUser.displayName.charAt(0) : "C"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-black dark:text-slate-200 leading-none">
                {currentUser?.displayName}
              </span>
              <span className="text-[10px] text-slate-400 leading-none mt-1.5">
                Session: Active
              </span>
            </div>
          </div>

          {/* Color coding legend keys */}
          <div className="p-4 bg-white dark:bg-slate-900/40 border-b border-[#cbdce6] dark:border-slate-800 grid grid-cols-2 gap-2 text-[10px] font-semibold text-left">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 flex items-center justify-center text-[10px] palette-not-visited">0</span>
              <span className="text-slate-800 dark:text-slate-400">Not Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 flex items-center justify-center text-[10px] palette-not-answered">0</span>
              <span className="text-slate-800 dark:text-slate-400">Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 flex items-center justify-center text-[10px] palette-answered">0</span>
              <span className="text-slate-800 dark:text-slate-400">Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 flex items-center justify-center text-[10px] palette-marked-review">0</span>
              <span className="text-slate-800 dark:text-slate-400">Marked review</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5">
              <span className="w-6 h-6 flex items-center justify-center text-[10px] palette-answered-marked-review">0</span>
              <span className="text-slate-800 dark:text-slate-400">Answered & Marked (evaluated)</span>
            </div>
          </div>

          {/* Question Grid header */}
          <div className="bg-primary-700 text-white text-[11px] font-bold py-2 px-4 text-left border-y border-primary-800">
            {activeSection} Questions Palette
          </div>

          {/* Grid list representing active section's question numbers */}
          <div className="p-4 flex-1">
            {sectionsInfo[activeSection] && (
              <div className="grid grid-cols-5 gap-2.5">
                {questionsList.map((q, idx) => {
                  if (q.section !== activeSection) return null;
                  
                  const isCurrent = idx === currentIdx;
                  const state = paletteStates[idx];
                  
                  let styleClass = "palette-not-visited";
                  if (state === "not-answered") styleClass = "palette-not-answered";
                  else if (state === "answered") styleClass = "palette-answered";
                  else if (state === "marked-review") styleClass = "palette-marked-review";
                  else if (state === "answered-marked-review") styleClass = "palette-answered-marked-review";

                  return (
                    <button
                      key={idx}
                      onClick={() => navigateToQuestion(idx)}
                      className={`w-9 h-9 text-xs font-bold flex items-center justify-center transition-all ${styleClass} ${
                        isCurrent ? "ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-slate-900 scale-100" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cancel/Exit button panel */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-[#cbdce6] dark:border-slate-800">
            <button
              onClick={onCancel}
              className="w-full py-2 bg-red-50 hover:bg-red-200 border border-red-200 dark:border-red-950 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-xs rounded transition-colors"
            >
              Quit Exam Session
            </button>
          </div>

        </div>

      </div>

      {/* 4. Submission Confirmation Popup (Replicates Real Exam Detail Summaries) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 text-left">
            <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Info className="w-5 h-5 text-primary-500" />
              <span>Confirm Exam Submission</span>
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-400 mt-3">
              Review your progress summary scorecard below before submitting your final exam. You cannot change your responses once submitted.
            </p>

            {/* Scorecard Table summary */}
            <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
              <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 font-bold border-b border-slate-200 dark:border-slate-800">
                <span>Metric State</span>
                <span className="text-right">Questions Count</span>
              </div>
              <div className="p-2.5 space-y-2">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" />Answered:</span>
                  <span className="font-bold">{summaryStats.answered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-red-500" />Not Answered:</span>
                  <span className="font-bold">{summaryStats.notAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500" />Marked for Review:</span>
                  <span className="font-bold">{summaryStats.markedReview}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" />Answered & Marked (Evaluated):</span>
                  <span className="font-bold">{summaryStats.answeredMarked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300" />Not Visited:</span>
                  <span className="font-bold">{summaryStats.notVisited}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors"
              >
                Resume Test
              </button>
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow"
              >
                Submit and View Results
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
