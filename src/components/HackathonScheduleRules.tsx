import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  BookOpen,
  Award,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>HACKATHON HANDBOOK & TIMELINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Rules, Schedule & Submission Guidelines
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Everything you need to know about the 24-hour sprint milestones, judging criteria, code freeze, and event regulations.
        </p>
      </motion.div>

      {/* Subtab Switcher */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-center gap-1 text-xs font-semibold">
          <button
            onClick={() => setSubTab('timeline')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'timeline'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>24H Timeline</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'rules'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Rules & Conduct</span>
          </button>

          <button
            onClick={() => setSubTab('rubric')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'rubric'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Judging Rubric</span>
          </button>

          <button
            onClick={() => setSubTab('faq')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === 'faq'
                ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQ Preview</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: 24-HOUR TIMELINE */}
      {subTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Timeline (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Official 24-Hour Hackathon Schedule</span>
              </h3>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Live Synchronized
              </span>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:via-blue-400 before:to-slate-200">
              {HACKATHON_SCHEDULE.map((item, idx) => {
                const isActive = item.phase === 'active';
                const isPast = item.phase === 'past';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative group"
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[27px] sm:-left-[35px] top-2.5 w-4 h-4 rounded-full border-2 transition-transform ${
                        isActive
                          ? 'bg-blue-600 border-white shadow-md shadow-blue-500/50 scale-125'
                          : isPast
                          ? 'bg-slate-400 border-slate-300'
                          : 'bg-white border-slate-300'
                      }`}
                    />

                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                            {item.time}
                          </span>
                          <h4 className="text-sm font-serif font-bold text-slate-900">
                            {item.title}
                          </h4>
                        </div>

                        {isActive && (
                          <span className="text-[10px] font-mono font-bold text-blue-700 px-2 py-0.5 rounded-full bg-blue-100 animate-pulse flex items-center gap-1 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            CURRENT PHASE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Venue Showcase Cards (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <h4 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Venue & Logistics
              </h4>

              {/* Photo placeholder for venue */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 relative group">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="VIT Bhopal Auditorium Venue"
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="text-[11px] font-mono font-bold text-blue-300">Auditorium AB02</span>
                  <span className="text-xs font-semibold text-white">Main Hacking Floor & Stage</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">High-Speed Wi-Fi & Power</span>
                  Continuous dual-band Wi-Fi with extension sockets at every hacker desk.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-0.5">Meals & Energy Drinks</span>
                  Dinner, midnight snacks, breakfast, and energy drinks included with pass.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RULES & CONDUCT */}
      {subTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HACKATHON_RULES.map((rule, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white border border-slate-200/90 p-6 rounded-2xl space-y-2 hover:border-blue-300 shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5 text-slate-900 font-serif font-bold text-base">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-mono font-bold border border-blue-200">
                  0{idx + 1}
                </span>
                <h4>{rule.title}</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-8">
                {rule.detail}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: JUDGING RUBRIC */}
      {subTab === 'rubric' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Official Jury Evaluation Criteria (100 Points Total)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              All projects will be graded blindly by industry leaders and academic mentors on these five 20-point pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-slate-900">1. Innovation & Originality</span>
                <span className="font-mono text-blue-600 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-slate-600">
                Novelty of the solution, distinct market positioning, and creative problem-solving approach.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-slate-900">2. Technical Complexity</span>
                <span className="font-mono text-blue-600 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-slate-600">
                Model training, architectural depth, algorithmic efficiency, pipeline cleanliness, and API integrations.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-slate-900">3. UI/UX & User Delight</span>
                <span className="font-mono text-blue-600 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-slate-600">
                Intuitive user workflows, visual polish, responsiveness, accessibility, and error handling.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-slate-900">4. Pitch & Demonstration</span>
                <span className="font-mono text-blue-600 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-slate-600">
                3-minute live pitch delivery, answering jury questions crisply, and a functioning live demo without crashes.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-serif font-bold text-slate-900">5. Real-World Impact</span>
                <span className="font-mono text-blue-600 font-bold text-xs">20 Pts</span>
              </div>
              <p className="text-xs text-slate-600">
                Viability, scalability, social impact potential, and business feasibility beyond the hackathon.
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 flex flex-col justify-center text-center">
              <span className="text-xs font-mono text-blue-700 font-bold uppercase">Total Prize Pool</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1">₹1,50,000</span>
              <span className="text-[10px] text-slate-600 mt-1">Plus Cloud Credits & Direct Interviews</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FAQS PREVIEW */}
      {subTab === 'faq' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-sm font-serif font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
