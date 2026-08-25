import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { HACKATHON_RULES, HACKATHON_SCHEDULE } from '../data/mockData';

export const HackathonScheduleRules: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-tl-item',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const rubricItems = [
    { name: 'Innovation & Originality', pts: 20, desc: 'Novelty of the solution, distinct market positioning, and creative problem-solving.' },
    { name: 'Technical Complexity', pts: 20, desc: 'Architecture depth, algorithmic efficiency, pipeline quality, and API integrations.' },
    { name: 'UI/UX & User Delight', pts: 20, desc: 'Intuitive workflows, visual polish, responsiveness, accessibility, and error handling.' },
    { name: 'Pitch & Demonstration', pts: 20, desc: '3-minute live pitch delivery, answering jury questions, and a functioning MVP.' },
    { name: 'Real-World Impact', pts: 20, desc: 'Viability, scalability, social impact potential, and business feasibility.' },
  ];

  return (
    <section id="timeline-section" ref={sectionRef} className="py-24 border-t-3 border-[#FF5F00] bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[13px] font-mono text-[#FF5F00] uppercase tracking-wider block mb-2 font-bold">
            24-Hour Schedule
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-[#FF5F00] comic-title max-w-2xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Check-in to awards. Every hour mapped.
          </h2>
        </div>

        {/* Two-column: sticky heading + timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left sticky column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="comic-card p-6 bg-[#0D0E12] border-3 border-[#FF5F00] shadow-[5px_5px_0px_#000] space-y-3">
                <h3
                  className="text-xl font-bold text-[#FF5F00] font-subheading uppercase"
                >
                  Venue & Logistics
                </h3>
                <p className="text-[13px] text-neutral-300 leading-relaxed font-body font-bold">
                  Auditorium AB02, VIT Bhopal University. High-speed Wi-Fi, 
                  power at every desk, continuous meals, energy drinks, and designated sleep zones.
                </p>
              </div>

              {/* Venue photo card */}
              <div className="comic-card overflow-hidden h-48 border-3 border-[#FF5F00] shadow-[5px_5px_0px_#000]">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="VIT Bhopal Auditorium"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status List */}
              <div className="comic-card p-4 border-3 border-[#FF5F00] bg-black divide-y-2 divide-[#FF5F00] text-xs font-mono font-bold">
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">WI-FI & POWER</span>
                  <span className="text-[#FF5F00]">UNLIMITED ✓</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">MEALS</span>
                  <span className="text-[#FFC599]">DINNER & BREAKFAST</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">REST ZONES</span>
                  <span className="text-[#FFC599]">AVAILABLE 24H</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-neutral-500">COMPUTE CREDITS</span>
                  <span className="text-[#FF5F00]">GPU CREDITS PROVIDED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="lg:col-span-8 space-y-5 relative pl-5 sm:pl-10">
            {/* Vertical connector track line */}
            <div className="absolute left-[15px] sm:left-[24px] top-6 bottom-6 w-1 border-l-3 border-dashed border-[#FF5F00]/25 z-0" />

            {HACKATHON_SCHEDULE.map((item, idx) => {
              const isActive = item.phase === 'active';
              const isPast = item.phase === 'past';

              return (
                <div
                  key={idx}
                  className={`gsap-tl-item comic-card p-5 bg-[#0D0E12] border-3 flex gap-6 items-center transition-all relative z-10 ${
                    isActive 
                      ? 'border-[#FF5F00] shadow-[6px_6px_0px_#000]' 
                      : isPast 
                      ? 'opacity-30 border-neutral-900' 
                      : 'border-[#FF5F00] shadow-[4px_4px_0px_#000]'
                  }`}
                >
                  {/* Timeline indicator node physically placed on the line */}
                  {isActive && (
                    <div className="absolute left-[-23px] sm:-left-[30px] top-1/2 -translate-y-1/2 z-20">
                      <span className="absolute w-4.5 h-4.5 rounded-full bg-[#FF5F00] border-2 border-black animate-ping" />
                      <span className="relative block w-4.5 h-4.5 rounded-full bg-[#FF5F00] border-3 border-black" />
                    </div>
                  )}

                  {/* Time Badge (No white) */}
                  <div className="w-24 shrink-0 font-mono text-[11px] font-bold text-center bg-black border-2 border-[#FF5F00] py-1.5 px-2 text-[#FF5F00] shadow-[2px_2px_0px_#000]">
                    {item.time}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h4
                        className={`text-[15px] font-bold font-subheading uppercase ${isActive ? 'text-[#FF5F00]' : 'text-[#FFC599]'}`}
                      >
                        {item.title}
                      </h4>
                      {isActive && (
                        <span className="text-[9px] font-mono font-bold bg-[#FF5F00] text-black px-1.5 py-0.5 border border-black uppercase tracking-wider animate-pulse">
                          Active Phase
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-neutral-450 leading-relaxed font-body font-bold">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules & Rubric Expandables */}
        <div className="mt-24 space-y-4">
          
          {/* Rules Panel */}
          <div className="comic-card border-3 border-[#FF5F00] bg-[#0D0E12] shadow-[5px_5px_0px_#000]">
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full p-6 flex items-center justify-between cursor-pointer group"
            >
              <h3
                className="text-xl md:text-2xl font-bold text-[#FFC599] font-subheading group-hover:text-[#FF5F00] transition-colors uppercase"
              >
                Rules & Code of Conduct
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-[#FF5F00] transition-transform duration-300 ${
                  rulesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {rulesOpen && (
              <div className="p-6 border-t-3 border-[#FF5F00] grid grid-cols-1 md:grid-cols-2 gap-6 bg-black">
                {HACKATHON_RULES.map((rule, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border-2 border-[#FF5F00] bg-[#0D0E12] shadow-[3px_3px_0px_#000]">
                    <span
                      className="text-xl font-mono font-extrabold text-[#FF5F00] shrink-0"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4
                        className="text-[14px] font-bold text-[#FFC599] mb-1 font-subheading uppercase"
                      >
                        {rule.title}
                      </h4>
                      <p className="text-[12px] text-neutral-400 leading-relaxed font-body">
                        {rule.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judging Rubric Panel */}
          <div className="comic-card border-3 border-[#FF5F00] bg-[#0D0E12] shadow-[5px_5px_0px_#000]">
            <button
              onClick={() => setRubricOpen(!rubricOpen)}
              className="w-full p-6 flex items-center justify-between cursor-pointer group"
            >
              <h3
                className="text-xl md:text-2xl font-bold text-[#FFC599] font-subheading group-hover:text-[#FF5F00] transition-colors uppercase"
              >
                Judging Criteria — 100 Points
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-[#FF5F00] transition-transform duration-300 ${
                  rubricOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {rubricOpen && (
              <div className="p-6 border-t-3 border-[#FF5F00] bg-black">
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
                  {rubricItems.map((item, idx) => (
                    <div key={idx} className="comic-card p-5 bg-[#0D0E12] border-3 border-[#FF5F00] shadow-[4px_4px_0px_#000]">
                      <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-neutral-850">
                        <span
                          className="text-3xl font-extrabold text-[#FF5F00] font-subheading"
                        >
                          {item.pts}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">pts</span>
                      </div>
                      <h4
                        className="text-[13px] font-bold text-[#FFC599] mb-2 font-subheading uppercase"
                      >
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-neutral-400 leading-relaxed font-body">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex items-center justify-between py-4 px-6 border-3 border-black bg-[#FF5F00] text-black">
                  <span className="text-[13px] font-mono font-bold uppercase">Total Prize Pool</span>
                  <span
                    className="text-3xl font-extrabold font-subheading"
                  >
                    ₹1,50,000+
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
