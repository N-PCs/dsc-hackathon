import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Trophy, Award, Medal, CheckCircle2, ShieldCheck, Gift, Gavel } from 'lucide-react';

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
      rank: '1ST PRIZE',
      subtitle: 'GRAND CHAMPION',
      amount: '₹7,000',
      extras: ['Winner Trophy', 'Certificate of Achievement', 'Exclusive Swag Box'],
      icon: Trophy,
      tagBg: 'bg-[#FF3B00]',
      iconColor: 'text-[#FF3B00]',
    },
    {
      rank: '2ND PRIZE',
      subtitle: 'FIRST RUNNER-UP',
      amount: '₹5,000',
      extras: ['Runner-Up Trophy', 'Certificate of Achievement', 'Swag Kit'],
      icon: Award,
      tagBg: 'bg-neutral-600',
      iconColor: 'text-neutral-300',
    },
    {
      rank: '3RD PRIZE',
      subtitle: 'SECOND RUNNER-UP',
      amount: '₹3,000',
      extras: ['Runner-Up Trophy', 'Certificate of Achievement', 'Swag Kit'],
      icon: Medal,
      tagBg: 'bg-[#FF5511]',
      iconColor: 'text-[#FF5511]',
    },
  ];

  return (
    <section id="prizes-section" ref={sectionRef} className="py-20 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 border-b border-[#222222] pb-6">
          <div>
            <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-2 font-bold">
              REWARDS & RECOGNITION CATALOG
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-white uppercase tracking-wider">
              PRIZE POOL & GOODIES
            </h2>
          </div>
          <div className="text-right md:text-left">
            <span className="font-heading text-sm text-[#FF3B00] uppercase tracking-widest block mb-1 font-bold">
              TOTAL PRIZE POOL: ₹15,000 CASH + GOODIES
            </span>
            <p className="text-xs text-neutral-400 max-w-md font-sans">
              Total Cash Prize Pool of ₹15,000 along with Goodies worth ₹50,000+ for participants!
            </p>
          </div>
        </div>

        {/* Top 3 Winner Cards — Styled like comic catalog posters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {prizes.map((prize, idx) => {
            const IconComponent = prize.icon;
            return (
              <div
                key={idx}
                className="gsap-prize-card bg-[#141414] border border-[#262626] p-8 flex flex-col justify-between group cursor-pointer hover:border-[#FF3B00] hover:bg-[#181818] transition-all relative"
              >
                <div className="tape-strip" />
                <div className={`bookmark-tag ${prize.tagBg}`}>
                  {prize.subtitle}
                </div>

                <div>
                  {/* Rank Header */}
                  <div className="flex items-center justify-between mb-6 pt-4">
                    <span className="font-heading text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      CATEGORY {String(idx + 1).padStart(2, '0')}
                    </span>
                    <IconComponent className={`w-8 h-8 ${prize.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>

                  {/* Rank Title */}
                  <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                    {prize.rank}
                  </h3>

                  {/* Cash Amount */}
                  <div className="my-4 border-b border-[#222222] pb-4">
                    <span className="font-display text-5xl text-white tracking-wider">
                      {prize.amount}
                    </span>
                  </div>
                </div>

                {/* Included Perks */}
                <div className="mt-4 space-y-2.5">
                  {prize.extras.map((extra, eIdx) => (
                    <div key={eIdx} className="flex items-center gap-2 text-xs text-neutral-300 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-[#FF3B00] shrink-0" />
                      <span>{extra}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Goodies & Judges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Goodies Box */}
          <div className="gsap-prize-card bg-[#141414] border border-[#262626] p-6 flex items-start gap-5 relative">
            <div className="tape-strip-left" />
            <div className="p-3 bg-black border border-[#262626] shrink-0">
              <Gift className="w-7 h-7 text-[#FF3B00]" />
            </div>
            <div>
              <div className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest font-bold mb-1">
                SWAG & GOODIES
              </div>
              <h4 className="font-display text-2xl text-white mb-1">
                GOODIES WORTH ₹50,000+
              </h4>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                T-shirts, stickers, cloud credits, tech perks, and exclusive swag kits distributed to hackers!
              </p>
            </div>
          </div>

          {/* Judges Box */}
          <div className="gsap-prize-card bg-[#141414] border border-[#262626] p-6 flex items-start gap-5 relative">
            <div className="tape-strip" />
            <div className="p-3 bg-black border border-[#262626] shrink-0">
              <Gavel className="w-7 h-7 text-[#FF3B00]" />
            </div>
            <div>
              <div className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest font-bold mb-1">
                OFFICIAL JURY PANEL
              </div>
              <h4 className="font-display text-2xl text-white mb-1">
                SHREYIANS CODING ACADEMY
              </h4>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Expert evaluation and live pitch feedback conducted by esteemed industry educators from Shreyians Coding Academy.
              </p>
            </div>
          </div>
        </div>

        {/* Participation Banner */}
        <div className="gsap-prize-card bg-[#141414] border border-[#262626] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-black border border-[#262626] shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#FF3B00]" />
            </div>
            <div>
              <h4 className="font-display text-2xl text-white mb-1">
                PARTICIPATION CERTIFICATES FOR ALL TEAMS
              </h4>
              <p className="text-xs text-neutral-400 max-w-2xl font-sans leading-relaxed">
                Participation Certificates will be awarded to all participants who submit a valid project during the hackathon.
              </p>
            </div>
          </div>

          <span className="font-heading text-xs text-neutral-400 uppercase tracking-widest whitespace-nowrap border-l border-[#262626] pl-4 py-1">
            * SUBJECT TO PROJECT SUBMISSION
          </span>
        </div>
      </div>
    </section>
  );
};

