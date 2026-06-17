import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";

export default function Register({ setView }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError("All fields are required.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    try {
      setError("");
      setSubmitting(true);
      await register(email, password, name);
      setView("dashboard");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account.");
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
            Register Candidate Account
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Join thousands of candidates preparing for SBI Clerk Exams
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-100 dark:border-red-950 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-black dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

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
            <label className="block text-sm font-semibold text-black dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black dark:text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="pl-10 pr-4 py-2.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md shadow-primary-500/10 active:scale-98 transition-all disabled:opacity-50 mt-6"
          >
            {submitting ? "Registering account..." : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-700 dark:text-slate-400">
          Already registered?{" "}
          <button
            onClick={() => setView("login")}
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Login Here
          </button>
        </p>

      </div>
    </div>
  );
}
