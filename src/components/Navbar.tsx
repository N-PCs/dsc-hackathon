import React from 'react';
import { Sparkles, Terminal, Shield, Ticket, Send, Award, Clock, LogIn } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  activeTab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin';
  setActiveTab: (tab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin') => void;
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          id="nav-brand-logo"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 p-[1px] shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/30 transition-all">
            <div className="w-full h-full bg-[#121215] rounded-[11px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-white text-base sm:text-lg">
                ORIGIN<span className="text-emerald-400 font-mono">'26</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                24H LIVE
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-tight font-medium hidden sm:block">
              Data Science Club • Overnight Hackathon
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121215] p-1.5 rounded-xl border border-white/10">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Overview
          </button>

          <button
            id="nav-tab-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Rules & Timeline
          </button>

          <button
            id="nav-tab-register"
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Register Team
          </button>

          <button
            id="nav-tab-team"
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'team'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            My Team Pass {hasActiveTeam && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            id="nav-tab-submit"
            onClick={() => setActiveTab('submit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'submit'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Submit Project
          </button>
        </nav>

        {/* Right action with Clerk Auth */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#121215] border border-white/10 rounded-lg text-xs font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">{registeredTeamCount}</span>
            <span>Teams Registered</span>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                id="nav-btn-clerk-sign-in"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
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
                  avatarBox: 'w-9 h-9 rounded-xl border border-emerald-500/30',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around bg-[#0c0c0e] px-2 py-2 border-t border-white/10 overflow-x-auto text-[11px]">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'home' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-400'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'register' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-400'
          }`}
        >
          Register
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'team' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-400'
          }`}
        >
          ID Pass
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'submit' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-400'
          }`}
        >
          Submit
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap ${
            activeTab === 'schedule' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-zinc-400'
          }`}
        >
          Rules
        </button>
      </div>
    </header>
  );
};
