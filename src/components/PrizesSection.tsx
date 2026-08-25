import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Trophy, Award, Medal, CheckCircle2, ShieldCheck } from 'lucide-react';

export const PrizesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-prize-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const prizes = [
    {
      rank: 'Winner',
      subtitle: 'Grand Champion',
      amount: '₹7,000',
      extras: ['Trophy', 'Certificate of Achievement'],
      icon: Trophy,
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      accentBorder: 'hover:border-amber-500/50',
      glow: 'from-amber-500/10 via-transparent to-transparent',
      iconColor: 'text-amber-400',
    },
    {
      rank: '1st Runner-Up',
      subtitle: 'Second Place',
      amount: '₹5,000',
      extras: ['Trophy', 'Certificate of Achievement'],
      icon: Award,
      badgeBg: 'bg-slate-400/10 text-slate-300 border-slate-400/30',
      accentBorder: 'hover:border-slate-400/50',
      glow: 'from-slate-400/10 via-transparent to-transparent',
      iconColor: 'text-slate-300',
    },
    {
      rank: '2nd Runner-Up',
      subtitle: 'Third Place',
      amount: '₹3,000',
      extras: ['Trophy', 'Certificate of Achievement'],
      icon: Medal,
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      accentBorder: 'hover:border-orange-500/50',
      glow: 'from-orange-500/10 via-transparent to-transparent',
      iconColor: 'text-orange-400',
    },
  ];

  return (
    <section id="prizes-section" ref={sectionRef} className="py-20 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <span className="text-[11px] sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-2 sm:mb-3">
              Rewards & Recognition
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Prize Pool & Trophies
            </h2>
          </div>
          <p className="text-xs sm:text-[14px] text-neutral-500 max-w-md leading-relaxed">
            Compete across tracks to claim top cash awards, official trophies, and certificates of achievement.
          </p>
        </div>

        {/* Top 3 Winner Cards — Grid matching Sponsors layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-800 mb-8">
          {prizes.map((prize, idx) => {
            const IconComponent = prize.icon;
            return (
              <div
                key={idx}
                className="gsap-prize-card bg-black p-6 sm:p-10 flex flex-col justify-between group cursor-pointer hover:bg-neutral-950 transition-colors"
              >
                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-wider">
                      {prize.subtitle}
                    </span>
                    <IconComponent className={`w-6 h-6 ${prize.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>

                  {/* Rank Title */}
                  <h3
                    className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {prize.rank}
                  </h3>

                  {/* Cash Amount */}
                  <div className="my-4">
                    <span
                      className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {prize.amount}
                    </span>
                  </div>
                </div>

                {/* Included Perks */}
                <div className="mt-6 pt-6 border-t border-neutral-900 space-y-2">
                  {prize.extras.map((extra, eIdx) => (
                    <div key={eIdx} className="flex items-center gap-2 text-xs sm:text-[13px] text-neutral-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{extra}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Participation Banner */}
        <div className="gsap-prize-card bg-black/40 border border-neutral-800 p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-black border border-neutral-800 shrink-0">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h4
                className="text-lg font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Participation Certificates for All Participants
              </h4>
              <p className="text-[13px] text-neutral-400 max-w-2xl leading-relaxed">
                Participation Certificates will be awarded to all participants who submit a valid project during the hackathon.
              </p>
            </div>
          </div>

          <span className="text-[12px] font-mono text-neutral-500 uppercase tracking-wider whitespace-nowrap">
            * Subject to project submission
          </span>
        </div>
      </div>
    </section>
  );
};
