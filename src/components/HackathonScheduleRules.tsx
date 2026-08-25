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
    { name: 'Innovation & Originality', pts: 20, desc: 'Novelty of the solution, distinct market positioning, and creative problem-solving.' },
    { name: 'Technical Complexity', pts: 20, desc: 'Architecture depth, algorithmic efficiency, pipeline quality, and API integrations.' },
    { name: 'UI/UX & User Delight', pts: 20, desc: 'Intuitive workflows, visual polish, responsiveness, accessibility, and error handling.' },
    { name: 'Pitch & Demonstration', pts: 20, desc: '3-minute live pitch delivery, answering jury questions, and a functioning live demo.' },
    { name: 'Real-World Impact', pts: 20, desc: 'Viability, scalability, social impact potential, and business feasibility.' },
  ];

  return (
    <section id="timeline-section" ref={sectionRef} className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-3">
            18-Hour Event Flow (4 Sep 6:00 PM – 5 Sep 12:00 PM)
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold tracking-tight max-w-xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            From inauguration to awards. Every stage mapped.
          </h2>
        </div>

        {/* Two-column: sticky heading + timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left sticky column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="space-y-3">
                <h3
                  className="text-xl font-bold"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Venue & Logistics
                </h3>
                <p className="text-[14px] text-neutral-400 leading-relaxed">
                  AB02 Auditorium 1 & Auditorium 2, VIT Bhopal University. High-speed dual-band Wi-Fi, 
                  power at desk, dinner break, continuous refreshments, and rest zones.
                </p>
              </div>

              {/* Venue photo */}
              <div className="overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
                  alt="AB02 Auditorium 1 & Auditorium 2"
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between py-3 border-b border-neutral-800 text-[13px]">
                  <span className="text-neutral-500">Official Judges</span>
                  <span className="text-orange-500 font-medium">Shreyians Coding Academy</span>
                </div>
                <div className="flex justify-between py-3 border-b border-neutral-800 text-[13px]">
                  <span className="text-neutral-500">Wi-Fi & Power</span>
                  <span className="text-white font-medium">Included</span>
                </div>
                <div className="flex justify-between py-3 border-b border-neutral-800 text-[13px]">
                  <span className="text-neutral-500">Meals</span>
                  <span className="text-white font-medium">Dinner Break included</span>
                </div>
                <div className="flex justify-between py-3 border-b border-neutral-800 text-[13px]">
                  <span className="text-neutral-500">Venue</span>
                  <span className="text-white font-medium">AB02 Aud 1 & Aud 2</span>
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
                    className={`gsap-tl-item flex gap-6 py-5 border-b border-neutral-800 transition-colors ${
                      isActive ? 'border-l-2 border-l-orange-600 pl-6' : isPast ? 'opacity-40' : ''
                    }`}
                  >
                    {/* Time */}
                    <div className="w-20 shrink-0">
                      <span className="text-[13px] font-mono font-medium text-neutral-500">
                        {item.time}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4
                          className={`text-[15px] font-bold ${isActive ? 'text-orange-500' : 'text-white'}`}
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {item.title}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] font-mono font-semibold text-orange-500 uppercase tracking-wider">
                            Now
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-neutral-500 leading-relaxed">
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
          <div className="border-t border-neutral-800">
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full py-6 flex items-center justify-between cursor-pointer group"
            >
              <h3
                className="text-xl md:text-2xl font-bold group-hover:text-orange-500 transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Rules & Code of Conduct
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${
                  rulesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {rulesOpen && (
              <div className="pb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {HACKATHON_RULES.map((rule, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span
                      className="text-[13px] font-mono font-bold text-neutral-600 mt-0.5 shrink-0"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4
                        className="text-[15px] font-bold text-white mb-1"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {rule.title}
                      </h4>
                      <p className="text-[13px] text-neutral-500 leading-relaxed">
                        {rule.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Judging Rubric */}
          <div className="border-t border-neutral-800">
            <button
              onClick={() => setRubricOpen(!rubricOpen)}
              className="w-full py-6 flex items-center justify-between cursor-pointer group"
            >
              <h3
                className="text-xl md:text-2xl font-bold group-hover:text-orange-500 transition-colors"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Judging Criteria — 100 Points
              </h3>
              <ChevronDown
                className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${
                  rubricOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {rubricOpen && (
              <div className="pb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-px bg-neutral-800">
                  {rubricItems.map((item, idx) => (
                    <div key={idx} className="bg-black p-6">
                      <div className="flex items-baseline justify-between mb-3">
                        <span
                          className="text-2xl font-bold text-orange-500"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {item.pts}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-600 uppercase">pts</span>
                      </div>
                      <h4
                        className="text-[14px] font-bold text-white mb-2"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-neutral-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between py-4 border-t border-neutral-800">
                  <span className="text-[14px] text-neutral-400">Total Cash Prize Pool + Goodies</span>
                  <span
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    ₹15,000 Cash + ₹50,000+ Goodies
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
