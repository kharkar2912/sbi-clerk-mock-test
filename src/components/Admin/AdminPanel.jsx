import React, { useState } from "react";
import { useDatabase } from "../../context/DatabaseContext";
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  Users, 
  Database,
  Search, 
  X,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function AdminPanel() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, bulkUpload } = useDatabase();
  
  // Tab states: 'questions', 'upload', 'users'
  const [activeTab, setActiveTab] = useState("questions");
  
  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [secFilter, setSecFilter] = useState("All");

  // Single Question Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit'
  const [editingId, setEditingId] = useState(null);
  
  const [formFields, setFormFields] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    section: "English Language",
    topic: "",
    difficulty: "Easy",
    explanation: ""
  });

  // CSV paste state
  const [csvText, setCsvText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");

  const sectionsList = [
    "English Language",
    "Numerical Ability",
    "Reasoning Ability",
    "General Awareness",
    "Computer Knowledge"
  ];

  // Filtered Questions
  const filteredQs = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSec = secFilter === "All" || q.section === secFilter;
    return matchesSearch && matchesSec;
  });

  // CRUD handlers
  const handleOpenAdd = () => {
    setFormFields({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      section: "English Language",
      topic: "",
      difficulty: "Easy",
      explanation: ""
    });
    setModalMode("add");
    setShowModal(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    setFormFields({
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      section: q.section,
      topic: q.topic,
      difficulty: q.difficulty,
      explanation: q.explanation
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formFields.topic) {
      alert("Topic is required.");
      return;
    }
    
    try {
      if (modalMode === "add") {
        await addQuestion(formFields);
      } else {
        await updateQuestion(editingId, formFields);
      }
      setShowModal(false);
    } catch (err) {
      alert("Error saving question: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(id);
      } catch (err) {
        alert("Error deleting question.");
      }
    }
  };

  // CSV parsing logic: Simple parser handling commas and quotes
  function parseCSV(text) {
    const lines = [];
    let row = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push("");
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }
    return lines;
  }

  const handleCSVUpload = async () => {
    setUploadError("");
    setUploadStatus("");
    
    if (!csvText.trim()) {
      return setUploadError("Please paste your CSV text first.");
    }

    try {
      const rows = parseCSV(csvText.trim());
      if (rows.length < 2) {
        return setUploadError("CSV must contain at least headers and one row of data.");
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const expectedHeaders = ["question", "optiona", "optionb", "optionc", "optiond", "correctanswer", "section", "topic", "difficulty", "explanation"];
      
      // Check headers match
      const headersMatch = expectedHeaders.every(h => headers.includes(h));
      if (!headersMatch) {
        return setUploadError("CSV header names do not match expected format. Double check keys.");
      }

      // Map indices
      const qIdx = headers.indexOf("question");
      const aIdx = headers.indexOf("optiona");
      const bIdx = headers.indexOf("optionb");
      const cIdx = headers.indexOf("optionc");
      const dIdx = headers.indexOf("optiond");
      const keyIdx = headers.indexOf("correctanswer");
      const secIdx = headers.indexOf("section");
      const topicIdx = headers.indexOf("topic");
      const diffIdx = headers.indexOf("difficulty");
      const expIdx = headers.indexOf("explanation");

      const parsedQuestions = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 10) continue; // Skip empty rows

        parsedQuestions.push({
          question: row[qIdx]?.trim(),
          optionA: row[aIdx]?.trim(),
          optionB: row[bIdx]?.trim(),
          optionC: row[cIdx]?.trim(),
          optionD: row[dIdx]?.trim(),
          correctAnswer: row[keyIdx]?.trim().toUpperCase(),
          section: row[secIdx]?.trim(),
          topic: row[topicIdx]?.trim(),
          difficulty: row[diffIdx]?.trim(),
          explanation: row[expIdx]?.trim()
        });
      }

      if (parsedQuestions.length === 0) {
        return setUploadError("No valid rows were parsed from CSV.");
      }

      await bulkUpload(parsedQuestions);
      setUploadStatus(`Successfully uploaded ${parsedQuestions.length} questions to database!`);
      setCsvText("");
    } catch (err) {
      console.error(err);
      setUploadError("Parsing failed: " + err.message);
    }
  };

  // Question bank CSV exporter
  const handleExportQuestions = () => {
    const headers = ["question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "section", "topic", "difficulty", "explanation"];
    
    const csvRows = [headers.join(",")];
    
    questions.forEach(q => {
      const row = [
        `"${q.question.replace(/"/g, '""')}"`,
        `"${q.optionA.replace(/"/g, '""')}"`,
        `"${q.optionB.replace(/"/g, '""')}"`,
        `"${q.optionC.replace(/"/g, '""')}"`,
        `"${q.optionD.replace(/"/g, '""')}"`,
        `"${q.correctAnswer}"`,
        `"${q.section}"`,
        `"${q.topic.replace(/"/g, '""')}"`,
        `"${q.difficulty}"`,
        `"${q.explanation.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sbi_clerk_question_bank_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock list of registered candidates
  const mockUsers = [
    { name: "Rahul Sharma", email: "candidate@gmail.com", role: "Candidate", attempts: 3, best: 88.5, acc: 82.5, streak: 3 },
    { name: "Ananya Iyer", email: "ananya@gmail.com", role: "Candidate", attempts: 8, best: 91.2, acc: 85.0, streak: 6 },
    { name: "Vikram Malhotra", email: "vikram@yahoo.com", role: "Candidate", attempts: 4, best: 82.0, acc: 78.4, streak: 1 },
    { name: "SBI Administrator", email: "admin@sbi.com", role: "Administrator", attempts: 0, best: 0, acc: 0, streak: 0 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left transition-colors duration-200">
      
      <div className="flex items-center gap-3 bg-slate-900 text-white p-6 rounded-2xl mb-8 shadow border border-slate-950">
        <div className="p-3 bg-amber-500 rounded-xl text-slate-950 shadow-inner">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Admin Console</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Manage question banks, review stats, and import CSV bulk questions
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 mb-6">
        {[
          { id: "questions", label: "Manage Questions", icon: Database },
          { id: "upload", label: "CSV Bulk Upload", icon: Upload },
          { id: "users", label: "User Statistics", icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 dark:text-primary-400 font-bold"
                  : "border-transparent text-slate-700 hover:text-black dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "questions" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            
            {/* Search/Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search questions or topics..."
                  className="pl-9 pr-4 py-2 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>

              <select
                value={secFilter}
                onChange={(e) => setSecFilter(e.target.value)}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
              >
                <option value="All">All Sections</option>
                {sectionsList.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleExportQuestions}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-black dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition-colors shadow shadow-primary-500/10"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

          </div>

          {/* List display */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredQs.length > 0 ? (
              filteredQs.map((q) => (
                <div
                  key={q.id}
                  className="flex justify-between items-start gap-4 p-4 border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 rounded-xl"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-400">
                        {q.section}
                      </span>
                      <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-800 dark:text-slate-400">
                        Topic: {q.topic}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                        q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400" :
                        "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-black dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(q)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-700 py-10">No questions match your criteria.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-black dark:text-white">Bulk Question CSV Importer</h2>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
              Upload hundreds of questions instantly. Format should be standard CSV comma separated.
            </p>
          </div>

          {/* Guidelines alert */}
          <div className="bg-slate-55 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-black dark:text-slate-200 block mb-2">CSV Import Guidelines</span>
            <div className="space-y-1.5 text-slate-800 dark:text-slate-400 leading-relaxed font-mono">
              Headers: <strong className="text-primary-600 dark:text-primary-400">question,optionA,optionB,optionC,optionD,correctAnswer,section,topic,difficulty,explanation</strong>
              <ul className="list-disc pl-5 mt-1.5 space-y-1 font-sans">
                <li>Option keys: optionA, optionB, optionC, optionD</li>
                <li>correctAnswer values: A, B, C, or D (must be uppercase)</li>
                <li>section choices: "English Language", "Numerical Ability", "Reasoning Ability", "General Awareness", "Computer Knowledge"</li>
                <li>difficulty choices: "Easy", "Medium", "Hard"</li>
                <li>Enclose question fields containing commas inside quotes (e.g. "Find x, if x=5")</li>
              </ul>
            </div>
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-lg border border-red-100 dark:border-red-950 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadStatus && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-950 text-xs font-semibold">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadStatus}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Paste CSV Data
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder='question,optionA,optionB,optionC,optionD,correctAnswer,section,topic,difficulty,explanation&#10;"What is 2+2?","3","4","5","6","B","Numerical Ability","Arithmetic","Easy","Basic addition: 2+2=4"'
              className="w-full h-72 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-xs"
            />
          </div>

          <button
            onClick={handleCSVUpload}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md shadow-primary-500/10 active:scale-98 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Process pasted CSV Data</span>
          </button>

        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-black dark:text-white">Registered Candidate Statistics</h2>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
              Active candidates practicing and their diagnostic score averages
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 font-semibold text-black dark:text-slate-300">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4 text-center">Attempts</th>
                  <th className="py-3 px-4 text-center">Best Score</th>
                  <th className="py-3 px-4 text-center">Avg Accuracy</th>
                  <th className="py-3 px-4 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mockUsers.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3.5 px-4 font-semibold text-black dark:text-slate-200">{user.name}</td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-400 text-xs font-mono">{user.email}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-black dark:text-slate-300">{user.attempts}</td>
                    <td className="py-3.5 px-4 text-center text-primary-600 dark:text-primary-400 font-bold">{user.best.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 font-bold">{user.acc.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-orange-550">{user.streak} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SINGLE QUESTION MODAL (Add / Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-100 dark:border-slate-800 text-left my-8">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-black dark:text-white">
                {modalMode === "add" ? "Create New Question" : "Modify Question Details"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-semibold text-black dark:text-slate-300">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">Section</label>
                  <select
                    value={formFields.section}
                    onChange={(e) => setFormFields(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  >
                    {sectionsList.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">Topic</label>
                  <input
                    type="text"
                    required
                    value={formFields.topic}
                    onChange={(e) => setFormFields(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g. Number Series, Syllogism"
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">Difficulty</label>
                  <select
                    value={formFields.difficulty}
                    onChange={(e) => setFormFields(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Question Description</label>
                <textarea
                  required
                  rows={4}
                  value={formFields.question}
                  onChange={(e) => setFormFields(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="Enter complete question statement here..."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">Option A</label>
                  <input
                    type="text"
                    required
                    value={formFields.optionA}
                    onChange={(e) => setFormFields(prev => ({ ...prev, optionA: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">Option B</label>
                  <input
                    type="text"
                    required
                    value={formFields.optionB}
                    onChange={(e) => setFormFields(prev => ({ ...prev, optionB: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">Option C</label>
                  <input
                    type="text"
                    required
                    value={formFields.optionC}
                    onChange={(e) => setFormFields(prev => ({ ...prev, optionC: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5">Option D</label>
                  <input
                    type="text"
                    required
                    value={formFields.optionD}
                    onChange={(e) => setFormFields(prev => ({ ...prev, optionD: e.target.value }))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5">Correct Option Answer Key</label>
                  <select
                    value={formFields.correctAnswer}
                    onChange={(e) => setFormFields(prev => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5">Step-by-Step Explanation</label>
                <textarea
                  rows={3}
                  value={formFields.explanation}
                  onChange={(e) => setFormFields(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Enter mathematical steps or grammatical justifications..."
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-black dark:text-slate-200 focus:outline-none text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-black dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg transition-colors shadow shadow-primary-500/10"
                >
                  {modalMode === "add" ? "Create Question" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
