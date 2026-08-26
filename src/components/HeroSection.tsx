import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Search, Filter } from 'lucide-react';
import { HackathonStats, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { SponsorsSection } from './SponsorsSection';
import { PrizesSection } from './PrizesSection';

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
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [selectedFilterTab, setSelectedFilterTab] = React.useState<string>('ALL ARENAS');

  // GSAP entrance animations
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        '.gsap-hero-title',
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 }
      )
        .fromTo(
          '.gsap-tagline',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.4'
        )
        .fromTo(
          '.gsap-cta',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(
          '.gsap-hero-poster',
          { scale: 1.05, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
          '-=0.8'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Animate stat numbers counting up
  useEffect(() => {
    if (!statsRef.current) return;

    const counters = statsRef.current.querySelectorAll('[data-count]');
    counters.forEach((el) => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      gsap.fromTo(
        el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2,
          delay: 0.5,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate: function () {
            const val = Math.round(gsap.getProperty(el, 'innerText') as number);
            el.textContent = val.toLocaleString();
          },
        }
      );
    });
  }, [stats]);

  const statItems = [
    { value: stats.totalParticipants || 200, suffix: '+', label: 'HACKERS REGISTERED' },
    { value: 18, suffix: ' HOURS', label: 'NON-STOP CODE FREEZE' },
    { value: 15000, suffix: '', label: 'CASH PRIZES (+₹50K GOODIES)', prefix: '₹' },
    { value: 6, suffix: ' ARENAS', label: 'INNOVATION TRACKS' },
  ];



  return (
    <div id="hero" ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-24">
      {/* Main hero catalog header section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        {/* Top meta tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3 font-heading text-xs md:text-sm uppercase tracking-widest text-[#FF3B00]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] animate-ping" />
            <span>4 SEP 6:00 PM – 5 SEP 12:00 PM</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300">AB02 AUDITORIUM 1 & 2</span>
          </div>

          <div className="font-heading text-xs uppercase tracking-widest text-neutral-400">
            DATA SCIENCE CLUB · VIT BHOPAL
          </div>
        </div>

        {/* Massive Catalog Style Headline & Description Box (Exact layout match to reference image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end my-8">
          {/* Huge condensed display headline */}
          <div className="lg:col-span-8 overflow-hidden">
            <h1 className="gsap-hero-title text-[clamp(4.5rem,14vw,11rem)] font-display uppercase tracking-tight leading-[0.85] text-white">
              <span className="text-[#FF3B00] block">ORIGIN</span>
              <span className="block text-white">HACKATHON</span>
            </h1>
          </div>

          {/* Right description block + Search widget */}
          <div className="lg:col-span-4 space-y-6">
            <p className="gsap-tagline text-sm text-neutral-300 leading-relaxed font-sans">
              Explore 6 innovation arenas, compete for ₹15,000 in cash prizes and ₹50,000+ in goodies. Evaluated live by esteemed educators from <strong className="text-white">Sheryians Coding Academy</strong>.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="hero-btn-register-team"
                onClick={() => onNavigate('register')}
                className="gsap-cta btn-primary"
              >
                REGISTER TEAM &gt;
              </button>

              <button
                id="hero-btn-schedule"
                onClick={() => onNavigate('schedule')}
                className="gsap-cta btn-outline"
              >
                VIEW SCHEDULE
              </button>
            </div>
          </div>
        </div>

        {/* Hero Showcase Information Cards Grid (Images Removed for High-Contrast Info Display) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-10">
          {/* Info Card 1 */}
          <div className="gsap-hero-poster relative bg-[#141414] border border-[#262626] p-6 group hover:border-[#FF3B00] hover:bg-[#181818] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div className="tape-strip" />
            <div className="bookmark-tag">18 HOURS</div>
            <div>
              <span className="font-heading text-xs uppercase tracking-widest text-[#FF3B00] block mb-2 font-bold">
                FLAGSHIP EVENT
              </span>
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                OVERNIGHT HACKATHON
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                4 Sep 6:00 PM – 5 Sep 12:00 PM
              </p>
            </div>
            <div className="pt-4 border-t border-[#222222] mt-4">
              <span className="font-heading text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                AB02 AUDITORIUM 1 & 2
              </span>
            </div>
          </div>

          {/* Info Card 2 */}
          <div className="gsap-hero-poster relative bg-[#141414] border border-[#262626] p-6 group hover:border-[#FF3B00] hover:bg-[#181818] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div className="tape-strip-left" />
            <div className="bookmark-tag">₹15,000</div>
            <div>
              <span className="font-heading text-xs uppercase tracking-widest text-emerald-400 block mb-2 font-bold">
                CASH + GOODIES
              </span>
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                PRIZE POOL & REWARDS
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                ₹15,000 Cash Pool + ₹50,000+ Goodies
              </p>
            </div>
            <div className="pt-4 border-t border-[#222222] mt-4">
              <span className="font-heading text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                TROPHIES, SWAG & CERTIFICATES
              </span>
            </div>
          </div>

          {/* Info Card 3 */}
          <div className="gsap-hero-poster relative bg-[#141414] border border-[#262626] p-6 group hover:border-[#FF3B00] hover:bg-[#181818] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div className="tape-strip" />
            <div className="bookmark-tag bg-blue-600">OFFICIAL JURY</div>
            <div>
              <span className="font-heading text-xs uppercase tracking-widest text-orange-400 block mb-2 font-bold">
                LIVE EVALUATION
              </span>
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                SHERYIANS ACADEMY
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                Judged live by industry expert educators
              </p>
            </div>
            <div className="pt-4 border-t border-[#222222] mt-4">
              <span className="font-heading text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                100-POINT SCORING RUBRIC
              </span>
            </div>
          </div>

          {/* Info Card 4 */}
          <div className="gsap-hero-poster relative bg-[#141414] border border-[#262626] p-6 group hover:border-[#FF3B00] hover:bg-[#181818] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div className="tape-strip-left" />
            <div className="bookmark-tag bg-purple-600">6 ARENAS</div>
            <div>
              <span className="font-heading text-xs uppercase tracking-widest text-purple-400 block mb-2 font-bold">
                INNOVATION TRACKS
              </span>
              <h3 className="font-display text-3xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                BUILD REAL PROJECTS
              </h3>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                AI/ML, Web3, FinTech, HealthTech & Open
              </p>
            </div>
            <div className="pt-4 border-t border-[#222222] mt-4">
              <span className="font-heading text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                TEAMS OF 2 TO 5 MEMBERS
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 border-y border-[#222222] my-12 bg-[#0E0E0E]">
          {statItems.map((item, i) => (
            <div
              key={i}
              className="gsap-stat-item py-8 px-6 border-r border-[#222222] last:border-r-0"
            >
              <div className="font-display text-4xl md:text-5xl text-white tracking-wider">
                {item.prefix && <span className="text-[#FF3B00]">{item.prefix}</span>}
                <span data-count={item.value}>0</span>
                {item.suffix && <span className="text-[#FF3B00]">{item.suffix}</span>}
              </div>
              <div className="font-heading text-xs text-neutral-400 mt-2 tracking-widest uppercase font-semibold">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsors Section — Placed before Prizes */}
      <SponsorsSection />

      {/* Prizes Section */}
      <PrizesSection />

    </div>
  );
};

