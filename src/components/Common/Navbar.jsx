import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { BookOpen, User, LogOut, Menu, X, LayoutDashboard, Compass, Calendar, Sparkles, ShieldAlert } from "lucide-react";

export default function Navbar({ currentView, setView }) {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const handleNav = (viewName) => {
    setView(viewName);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Dashboard", view: "dashboard", icon: LayoutDashboard },
    { label: "Practice Mode", view: "practice", icon: Compass },
    { label: "Daily Challenge", view: "challenge", icon: Calendar },
    { label: "AI Improvement", view: "ai_improvement", icon: Sparkles }
  ];

  if (currentUser.isAdmin) {
    navItems.push({ label: "Admin Panel", view: "admin", icon: ShieldAlert });
  }

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div 
              onClick={() => handleNav("dashboard")}
              className="flex items-center gap-2 cursor-pointer font-bold text-lg text-primary-700 dark:text-primary-400 font-sans tracking-wide"
            >
              <BookOpen className="w-6 h-6 text-primary-600" />
              <span>SBI Clerk <span className="font-light text-slate-700 dark:text-slate-400">MockHub</span></span>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNav(item.view)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all gap-1.5 ${
                      active
                        ? "bg-primary-50 dark:bg-primary-950/35 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50"
                        : "text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Section: Theme Toggle & User Info */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {/* Profile Dropdown / Card */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-primary-850">
                {currentUser.displayName ? currentUser.displayName.charAt(0) : <User className="w-4 h-4" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-black dark:text-slate-200 leading-none">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-slate-700 dark:text-slate-400 leading-none mt-1">
                  {currentUser.isAdmin ? "Administrator" : "Candidate"}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center md:hidden gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Details */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 pt-2 pb-4 space-y-1 transition-all">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`flex items-center w-full px-3 py-2.5 rounded-lg text-base font-medium transition-colors gap-2.5 ${
                  active
                    ? "bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-400"
                    : "text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3 px-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                {currentUser.displayName ? currentUser.displayName.charAt(0) : "C"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-black dark:text-slate-200 leading-none">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-slate-400 leading-none mt-1">
                  {currentUser.email}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-red-200 dark:border-red-950 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
