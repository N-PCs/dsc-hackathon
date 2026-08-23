import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  Award,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  FileCode,
  Globe,
  FileText,
  Video,
} from 'lucide-react';
import { HACKATHON_RULES, HACKATHON_SCHEDULE } from '../data/mockData';

const FAQS = [
  {
    q: 'Who is eligible to participate in Origin Overnight Hackathon?',
    a: 'Undergraduate and postgraduate students from any recognized university or college (including VIT Bhopal and external colleges) are eligible. Teams can consist of 1 to 4 participants.',
  },
  {
    q: 'What is the format and duration of the event?',
    a: 'It is a 24-hour non-stop overnight hackathon. Food, energy drinks, high-speed Wi-Fi, compute credits, and rest zones are provided at the campus venue.',
  },
  {
    q: 'When and how do we submit our project?',
    a: 'You must register first to receive your Team ID and Pass. Once registered, access the "Submit Project" tab on this website anytime before the 11:00 AM code freeze deadline with your GitHub repo, live deployment link, and pitch slides.',
  },
  {
    q: 'Can we build on pre-existing projects or code written before the hackathon?',
    a: 'No. All project code must be developed strictly during the 24-hour hacking window. You are free to use open-source frameworks, packages, and public APIs with proper attribution in your README.',
  },
  {
    q: 'How does payment verification and the Digital ID Pass work?',
    a: 'Upon registering and uploading your UPI transaction UTR / receipt screenshot, the DSC Admin team verifies the entry and issues your verified digital ID badge with QR code for venue gate entry and food coupons.',
  },
];

export const HackathonScheduleRules: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subTab, setSubTab] = useState<'timeline' | 'rules' | 'rubric' | 'faq'>('timeline');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>HACKATHON HANDBOOK & TIMELINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Rules, Schedule & Submission Guidelines
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          Everything you need to know about the 24-hour sprint milestones, judging criteria, code freeze, and event regulations.
        </p>
      </div>

      {/* Switcher */}
      <div className="flex items-center justify-center">
        <div className="bg-[#111114] p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setSubTab('timeline')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'timeline'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>24H Timeline</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'rules'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rules & Conduct</span>
          </button>

          <button
            onClick={() => setSubTab('rubric')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'rubric'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Judging Rubric</span>
          </button>

          <button
            onClick={() => setSubTab('faq')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'faq'
                ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 24-HOUR TIMELINE */}
      {subTab === 'timeline' && (
        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Official 24-Hour Hackathon Schedule</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Live Synchronized
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-400/50 before:to-zinc-800">
            {HACKATHON_SCHEDULE.map((item, idx) => {
              const isActive = item.phase === 'active';
              const isPast = item.phase === 'past';

              return (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform ${
                      isActive
                        ? 'bg-emerald-400 border-white shadow-lg shadow-emerald-400/50 scale-125'
                        : isPast
                        ? 'bg-zinc-700 border-zinc-500'
                        : 'bg-[#111114] border-zinc-600'
                    }`}
                  />

                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#18181b] border-emerald-500/50 shadow-md'
                        : 'bg-[#18181b]/50 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.time}
                        </span>
                        <h4 className="text-sm font-serif font-bold text-white">
                          {item.title}
                        </h4>
                      </div>

                      {isActive && (
                        <span className="text-[10px] font-mono font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 animate-pulse flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          CURRENT PHASE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: RULES & CONDUCT */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HACKATHON_RULES.map((rule, idx) => (
            <div
              key={idx}
              className="bg-[#111114] border border-white/10 p-5 sm:p-6 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold border border-emerald-500/20">
                  0{idx + 1}
                </span>
                <h4>{rule.title}</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed pl-8">
                {rule.detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: JUDGING RUBRIC */}
      {subTab === 'rubric' && (
        <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-xl font-serif font-bold text-white">
              Official Jury Evaluation Criteria (100 Points Total)
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              All projects will be graded blindly by industry leaders and academic mentors on these five 20-point pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 bg-[#18181b] rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-white">1. Innovation & Originality</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Novelty of the solution, distinct market positioning, and creative problem-solving approach.
              </p>
            </div>

            <div className="p-5 bg-[#18181b] rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-white">2. Technical Complexity</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Model training, architectural depth, algorithmic efficiency, pipeline cleanliness, and API integrations.
              </p>
            </div>

            <div className="p-5 bg-[#18181b] rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-white">3. UI/UX & User Delight</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Intuitive user workflows, visual polish, responsiveness, accessibility, and error handling.
              </p>
            </div>

            <div className="p-5 bg-[#18181b] rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-white">4. Pitch & Demonstration</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-zinc-400">
                3-minute live pitch delivery, answering jury questions crisply, and a functioning live demo without crashes.
              </p>
            </div>

            <div className="p-5 bg-[#18181b] rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-white">5. Real-World Impact</span>
                <span className="font-mono text-emerald-400 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-zinc-400">
                Viability, scalability, social impact potential, and business feasibility beyond the hackathon.
              </p>
            </div>

            <div className="p-5 bg-[#18181b] rounded-2xl border border-emerald-500/30 flex flex-col justify-center text-center">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Total Prize Pool</span>
              <span className="text-2xl font-bold text-white font-mono mt-1">₹1,50,000</span>
              <span className="text-[10px] text-zinc-400 mt-1">Plus Cloud Credits & Direct Interviews</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FAQS */}
      {subTab === 'faq' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#111114] border border-white/10 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-serif font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-white/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
