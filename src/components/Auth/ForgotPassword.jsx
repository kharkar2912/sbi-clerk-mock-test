import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Mail, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPassword({ setView }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError("Please enter your email address.");
    }

    try {
      setError("");
      setSuccess("");
      setSubmitting(true);
      await forgotPassword(email);
      setSuccess("A password reset link has been sent to your email address. Please check your inbox (or local database logs).");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit password reset request.");
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-400">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg border border-red-100 dark:border-red-950 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-lg border border-emerald-100 dark:border-emerald-950 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-md shadow-primary-500/10 active:scale-98 transition-all disabled:opacity-50"
            >
              {submitting ? "Sending..." : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send Reset Email</span>
                </>
              )}
            </button>
          </form>
        ) : null}

        <div className="text-center pt-2">
          <button
            onClick={() => setView("login")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </button>
        </div>

      </div>
    </div>
  );
}
