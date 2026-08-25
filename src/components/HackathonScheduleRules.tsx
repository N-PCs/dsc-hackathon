import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
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
    { name: 'INNOVATION & ORIGINALITY', pts: 20, desc: 'Novelty of the solution, distinct market positioning, and creative problem-solving.' },
    { name: 'TECHNICAL COMPLEXITY', pts: 20, desc: 'Architecture depth, algorithmic efficiency, pipeline quality, and API integrations.' },
    { name: 'UI/UX & USER DELIGHT', pts: 20, desc: 'Intuitive workflows, visual polish, responsiveness, accessibility, and error handling.' },
    { name: 'PITCH & DEMONSTRATION', pts: 20, desc: '3-minute live pitch delivery, answering jury questions, and a functioning live demo.' },
    { name: 'REAL-WORLD IMPACT', pts: 20, desc: 'Viability, scalability, social impact potential, and business feasibility.' },
  ];

  return (
    <section id="timeline-section" ref={sectionRef} className="py-24 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 border-b border-[#222222] pb-6">
          <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-2 font-bold">
            18-HOUR EVENT FLOW (4 SEP 6:00 PM – 5 SEP 12:00 PM)
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-white uppercase tracking-wider max-w-2xl">
            FROM INAUGURATION TO AWARDS. EVERY STAGE MAPPED.
          </h2>
        </div>

        {/* Two-column: sticky heading + timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left sticky column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-3xl text-white">
                  VENUE & LOGISTICS
                </h3>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  AB02 Auditorium 1 & Auditorium 2, VIT Bhopal University. High-speed dual-band Wi-Fi, 
                  power at desk, dinner break, continuous refreshments, and rest zones.
                </p>
              </div>

              {/* Venue photo with poster frame */}
              <div className="overflow-hidden border border-[#262626] bg-[#141414] p-2 relative">
                <div className="tape-strip" />
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="AB02 Auditorium 1 & Auditorium 2"
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="space-y-3 pt-2 font-heading text-xs uppercase tracking-wider">
                <div className="flex justify-between py-3 border-b border-[#222222]">
                  <span className="text-neutral-400">OFFICIAL JUDGES</span>
                  <span className="text-[#FF3B00] font-bold">SHREYIANS CODING ACADEMY</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222222]">
                  <span className="text-neutral-400">WI-FI & POWER</span>
                  <span className="text-white font-bold">INCLUDED</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222222]">
                  <span className="text-neutral-400">MEALS</span>
                  <span className="text-white font-bold">DINNER BREAK INCLUDED</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#222222]">
                  <span className="text-neutral-400">VENUE</span>
                  <span className="text-white font-bold">AB02 AUD 1 & AUD 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Timeline */}
          <div className="lg:col-span-8">
            <div className="space-y-0">
              {HACKATHON_SCHEDULE.map((item, idx) => {
                const isActive = item.phase === 'active';
                const isPast = item.phase === 'past';

                return (
                  <div
                    key={idx}
                    className={`gsap-tl-item flex gap-6 py-5 border-b border-[#222222] transition-colors ${
                      isActive ? 'border-l-4 border-l-[#FF3B00] pl-6 bg-[#141414]' : isPast ? 'opacity-40' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="w-24 shrink-0">
                      <span className="font-mono text-xs font-bold text-[#FF3B00]">
                        {item.time}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`font-display text-xl ${isActive ? 'text-[#FF3B00]' : 'text-white'}`}>
                          {item.title}
                        </h4>
                        {isActive && (
                          <span className="font-heading text-[10px] font-bold text-[#FF3B00] uppercase tracking-wider bg-[#FF3B00]/10 px-2 py-0.5 border border-[#FF3B00]/30">
                            LIVE NOW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rules & Rubric — Expandable panels below */}
        <div className="mt-24 space-y-0">
          {/* Rules */}
          <div className="border-t border-[#222222]">
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full py-6 flex items-center justify-between cursor-pointer group"
            >
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors">
                RULES & CODE OF CONDUCT
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-neutral-400 transition-transform duration-300 ${
                  rulesOpen ? 'rotate-180 text-[#FF3B00]' : ''
                }`}
              />
            </button>

            {rulesOpen && (
              <div className="pb-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {HACKATHON_RULES.map((rule, idx) => (
                  <div key={idx} className="flex gap-4 bg-[#141414] border border-[#262626] p-5 relative">
                    <span className="font-mono text-xs font-bold text-[#FF3B00] shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-display text-xl text-white mb-1">
                        {rule.title}
                      </h4>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {rule.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judging Rubric */}
          <div className="border-t border-[#222222]">
            <button
              onClick={() => setRubricOpen(!rubricOpen)}
              className="w-full py-6 flex items-center justify-between cursor-pointer group"
            >
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors">
                JUDGING CRITERIA — 100 POINTS EVALUATION
              </h3>
              <ChevronDown
                className={`w-6 h-6 text-neutral-400 transition-transform duration-300 ${
                  rubricOpen ? 'rotate-180 text-[#FF3B00]' : ''
                }`}
              />
            </button>

            {rubricOpen && (
              <div className="pb-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {rubricItems.map((item, idx) => (
                    <div key={idx} className="bg-[#141414] border border-[#262626] p-6 relative">
                      <div className="flex items-baseline justify-between mb-3 border-b border-[#222222] pb-2">
                        <span className="font-display text-4xl text-[#FF3B00]">
                          {item.pts}
                        </span>
                        <span className="font-mono text-xs text-neutral-500 uppercase">PTS</span>
                      </div>
                      <h4 className="font-display text-lg text-white mb-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between py-4 border-t border-[#222222] gap-4">
                  <span className="font-heading text-xs text-neutral-400 uppercase tracking-widest">TOTAL CASH PRIZE POOL + GOODIES</span>
                  <span className="font-display text-3xl text-[#FF3B00]">
                    ₹15,000 CASH + ₹50,000+ GOODIES
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

