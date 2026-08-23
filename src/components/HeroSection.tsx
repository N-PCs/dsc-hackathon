import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Ticket,
  Users,
  Award,
  Layers,
  ChevronRight,
  BrainCircuit,
  Blocks,
  ShieldAlert,
  Activity,
  Cpu,
  Zap,
} from 'lucide-react';
import { HackathonStats, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';

interface HeroSectionProps {
  stats: HackathonStats;
  onNavigate: (tab: 'register' | 'team' | 'submit' | 'schedule') => void;
  onSelectTrack: (track: TrackType) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  stats,
  onNavigate,
  onSelectTrack,
}) => {
  // 24-hour countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({
    hours: 17,
    minutes: 34,
    seconds: 22,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden pb-16">
      {/* Ambient background glow & grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none opacity-30">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        {/* Top badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wide">DATA SCIENCE CLUB</span>
            <span className="text-emerald-500">•</span>
            <span>VIT BHOPAL CAMPUS & ONLINE</span>
          </div>
        </div>

        {/* Hero Title & Pitch */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white mb-6 leading-[1.1]">
            ORIGIN <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent italic">OVERNIGHT</span>
            <span className="block text-2xl sm:text-4xl lg:text-5xl mt-3 text-zinc-300 font-sans font-semibold tracking-normal">
              24-Hour Crucible of Innovation
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            The flagship overnight hackathon where elite builders, data scientists, and creators assemble to develop transformative AI, Web3, and DeepTech solutions from scratch.
          </p>
        </div>

        {/* 24-Hour Live Countdown Banner */}
        <div className="max-w-3xl mx-auto mb-12 p-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-white/10 to-teal-500/20 shadow-2xl">
          <div className="bg-[#111114] rounded-[15px] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <span>HACKING PHASE IN PROGRESS</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <div className="text-sm text-zinc-300 font-medium">
                  Time Remaining until Final Code Freeze
                </div>
              </div>
            </div>

            {/* Timer Digits */}
            <div className="flex items-center gap-2 sm:gap-3 font-mono">
              <div className="bg-[#18181b] border border-white/10 px-3.5 py-2 rounded-xl text-center min-w-[62px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">Hours</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">:</span>
              <div className="bg-[#18181b] border border-white/10 px-3.5 py-2 rounded-xl text-center min-w-[62px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">Mins</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400">:</span>
              <div className="bg-[#18181b] border border-emerald-500/30 px-3.5 py-2 rounded-xl text-center min-w-[62px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Call-to-actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            id="hero-btn-register-team"
            onClick={() => onNavigate('register')}
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Register Team
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-btn-my-pass"
            onClick={() => onNavigate('team')}
            className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 text-zinc-200 font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
          >
            <Ticket className="w-4 h-4 text-emerald-400" />
            View Digital ID Pass
          </button>

          <button
            id="hero-btn-submit-project"
            onClick={() => onNavigate('submit')}
            className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-teal-500/40 text-zinc-200 font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-teal-400" />
            Submit Project Details
          </button>
        </div>

        {/* Live Metrics Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          <div className="bg-[#111114] border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Teams</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {stats.totalTeams}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Across 6 major innovation tracks
            </p>
          </div>

          <div className="bg-[#111114] border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Badges</span>
              <ShieldCheck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-mono">
              {stats.verifiedTeams}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Payment confirmed & gate-ready
            </p>
          </div>

          <div className="bg-[#111114] border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Hackers</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              {stats.totalParticipants}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Active student innovators
            </p>
          </div>

          <div className="bg-[#111114] border border-white/10 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Prize Pool</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              ₹1,50,000+
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Cash, cloud credits & internships
            </p>
          </div>
        </div>

        {/* Hackathon Tracks Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-white/10 gap-4">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider font-semibold mb-1">
                Domain Tracks
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Choose Your Innovation Arena
              </h2>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              View Judging Rubric <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HACKATHON_TRACKS.map((track, idx) => {
              const trackCount = stats.trackCounts[track.name] || 0;
              return (
                <div
                  key={idx}
                  id={`track-card-${idx}`}
                  onClick={() => {
                    onSelectTrack(track.name);
                    onNavigate('register');
                  }}
                  className="group relative bg-[#111114] hover:bg-[#16161b] border border-white/10 hover:border-emerald-500/40 p-5 rounded-2xl transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        {idx === 0 && <BrainCircuit className="w-5 h-5" />}
                        {idx === 1 && <Blocks className="w-5 h-5" />}
                        {idx === 2 && <ShieldAlert className="w-5 h-5" />}
                        {idx === 3 && <Activity className="w-5 h-5" />}
                        {idx === 4 && <Cpu className="w-5 h-5" />}
                        {idx === 5 && <Zap className="w-5 h-5" />}
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#18181b] border border-white/5 text-zinc-300">
                        {trackCount} Teams
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors mb-1.5">
                      {track.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-emerald-400">
                    <span>Select this track</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
