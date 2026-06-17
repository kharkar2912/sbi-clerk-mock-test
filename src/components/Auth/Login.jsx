import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mail, Lock, LogIn, AlertCircle } from "lucide-react";

export default function Login({ setView }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError("Please fill in all fields.");
    }
    try {
      setError("");
      setSubmitting(true);
      await login(email, password);
      setView("dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to prefill and log in for demo testing
  const handleQuickLogin = async (type) => {
    const creds = type === "admin" 
      ? { email: "admin@sbi.com", pass: "adminpassword" }
      : { email: "candidate@gmail.com", pass: "password123" };
    
    setEmail(creds.email);
    setPassword(creds.pass);
    try {
      setError("");
      setSubmitting(true);
      await login(creds.email, creds.pass);
      setView("dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-100 dark:border-slate-800">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-primary-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-slate-100">
            SBI Clerk Exam Hub
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Prepare with realistic real-time exam simulations
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-100 dark:border-red-950 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-black dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@gmail.com"
                  className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-black dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setView("forgot_password")}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md shadow-primary-500/10 active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? "Signing in..." : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Panel for testing */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick Testing Credentials
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("candidate")}
              className="flex flex-col items-center p-2 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
            >
              <span className="font-semibold text-primary-700 dark:text-primary-400">Candidate Account</span>
              <span className="text-slate-400 mt-0.5">candidate@gmail.com</span>
            </button>
            <button
              onClick={() => handleQuickLogin("admin")}
              className="flex flex-col items-center p-2 text-xs border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all"
            >
              <span className="font-semibold text-amber-600">Admin Account</span>
              <span className="text-slate-400 mt-0.5">admin@sbi.com</span>
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-700 dark:text-slate-400 pt-2">
          New candidate?{" "}
          <button
            onClick={() => setView("register")}
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Register Here
          </button>
        </p>

      </div>
    </div>
  );
}
