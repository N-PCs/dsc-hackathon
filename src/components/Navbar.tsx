import React from 'react';
import { Sparkles, Terminal, Shield, Ticket, Send, Clock, LogIn, HelpCircle } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  activeTab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'faq';
  setActiveTab: (
    tab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'faq'
  ) => void;
  registeredTeamCount: number;
  hasActiveTeam: boolean;
  isAdmin: boolean;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  registeredTeamCount,
  hasActiveTeam,
  isAdmin,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 p-[1px] shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/35 transition-all">
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-slate-900 text-base sm:text-lg">
                ORIGIN<span className="text-blue-600 font-mono">'26</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                24H LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 tracking-tight font-medium hidden sm:block">
              Data Science Club • Overnight Hackathon
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            id="nav-tab-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Rules & Timeline
          </button>

          <button
            id="nav-tab-register"
            onClick={() => setActiveTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Register Team
          </button>

          <button
            id="nav-tab-team"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            My Team Pass {hasActiveTeam && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
          </button>

          <button
            id="nav-tab-submit"
            onClick={() => setActiveTab('submit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'submit'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit Project
          </button>

          <button
            id="nav-tab-faq"
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </button>
        </nav>

        {/* Right Action Bar & Clerk Auth */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            <span className="text-blue-600 font-bold">{registeredTeamCount}</span>
            <span>Teams Registered</span>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                id="nav-btn-clerk-sign-in"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 rounded-xl border border-blue-500/40',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* Mobile navigation subbar */}
      <div className="md:hidden flex items-center justify-around bg-slate-100 px-2 py-2 border-t border-slate-200 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'home' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'register' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'team' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          ID Pass
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'submit' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          Submit
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'schedule' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          Rules
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'faq' ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'
          }`}
        >
          FAQ
        </button>
      </div>
    </header>
  );
};
