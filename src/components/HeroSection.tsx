import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  ChevronRight,
  BrainCircuit,
  Blocks,
  ShieldAlert,
  Activity,
  Cpu,
  Zap,
  MapPin,
  Code2,
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
    <div className="relative overflow-hidden pb-16 pt-6 sm:pt-10">
      {/* Background radial soft light gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-60">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100/70 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f008_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/90 text-blue-800 text-xs font-mono font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-bold tracking-wide">DATA SCIENCE CLUB</span>
            <span className="text-blue-300">•</span>
            <span>VIT BHOPAL CAMPUS & ONLINE</span>
          </div>
        </motion.div>

        {/* Asymmetric Hero Header & Visual Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Title & Pitch (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 text-left space-y-6"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-slate-900 leading-[1.08]">
              ORIGIN <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent italic">OVERNIGHT</span>
              <span className="block text-2xl sm:text-4xl lg:text-4xl mt-3 text-slate-700 font-sans font-semibold tracking-normal">
                24-Hour Crucible of Innovation
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
              The flagship overnight hackathon where elite student builders, data scientists, and creators assemble to construct transformative AI, Web3, and DeepTech solutions from scratch.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                id="hero-btn-register-team"
                onClick={() => onNavigate('register')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4.5 h-4.5" />
                Register Team
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="hero-btn-my-pass"
                onClick={() => onNavigate('team')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-sm transition-all cursor-pointer"
              >
                <Ticket className="w-4.5 h-4.5 text-blue-600" />
                View Digital ID Pass
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                id="hero-btn-submit-project"
                onClick={() => onNavigate('submit')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm sm:text-base flex items-center gap-2.5 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4.5 h-4.5 text-indigo-600" />
                Submit Project
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: Photo Gallery & Live Status Bento (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none space-y-4">
              {/* Overlapping Event Photo Card (Placeholder ready for replacement) */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
                  alt="ORIGIN Hackathon Innovation Arena"
                  className="w-full h-56 sm:h-64 object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent p-5 flex flex-col justify-end text-white">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-300 font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auditorium AB02 • VIT Bhopal</span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    24 Hours of Non-Stop Coding
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    High-speed Wi-Fi, compute credits, meals & mentor support provided on site.
                  </p>
                </div>
              </div>

              {/* Overlapping Floating Badge */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-lg flex items-center justify-between gap-4 -mt-6 ml-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Code Freeze Protocol
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Strict 11:00 AM Deadline
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                  LIVE JURY
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 24-Hour Live Countdown Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto mb-16 p-1 rounded-3xl bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-indigo-600/20 shadow-md"
        >
          <div className="bg-white rounded-[22px] p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                  <span>HACKING PHASE IN PROGRESS</span>
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                </div>
                <div className="text-sm text-slate-700 font-semibold mt-0.5">
                  Time Remaining until Final Code Freeze & Pitching
                </div>
              </div>
            </div>

            {/* Timer Digits */}
            <div className="flex items-center gap-2 sm:gap-3 font-mono">
              <div className="bg-slate-900 text-white border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[68px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Hours</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">:</span>
              <div className="bg-slate-900 text-white border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[68px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Mins</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">:</span>
              <div className="bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl text-center min-w-[68px]">
                <span className="block text-2xl sm:text-3xl font-extrabold text-blue-700">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-blue-600 uppercase font-bold">Secs</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Metrics Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto mb-16">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Registered Teams</span>
              <Users className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono">
              {stats.totalTeams}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Across 6 innovation tracks
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Passes</span>
              <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 font-mono">
              {stats.verifiedTeams}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Payment confirmed & gate-ready
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Hackers</span>
              <Flame className="w-4.5 h-4.5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 font-mono">
              {stats.totalParticipants}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Active student innovators
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Prize Pool</span>
              <Award className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-blue-700 font-mono">
              ₹1,50,000+
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Cash, cloud credits & internships
            </p>
          </motion.div>
        </div>

        {/* Hackathon Tracks Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="text-xs font-mono text-blue-600 uppercase tracking-wider font-bold mb-1">
                Domain Arenas
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                Choose Your Innovation Track
              </h2>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View Judging Rubric <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HACKATHON_TRACKS.map((track, idx) => {
              const trackCount = stats.trackCounts[track.name] || 0;
              return (
                <motion.div
                  key={idx}
                  id={`track-card-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    onSelectTrack(track.name);
                    onNavigate('register');
                  }}
                  className="group bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                        {idx === 0 && <BrainCircuit className="w-5.5 h-5.5" />}
                        {idx === 1 && <Blocks className="w-5.5 h-5.5" />}
                        {idx === 2 && <ShieldAlert className="w-5.5 h-5.5" />}
                        {idx === 3 && <Activity className="w-5.5 h-5.5" />}
                        {idx === 4 && <Cpu className="w-5.5 h-5.5" />}
                        {idx === 5 && <Zap className="w-5.5 h-5.5" />}
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        {trackCount} Teams
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5">
                      {track.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Select this track</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
