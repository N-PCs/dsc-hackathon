import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Calendar, AlertTriangle } from 'lucide-react';
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

  // GSAP entrance animations
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      // Stagger each word of the title
      tl.fromTo(
        '.gsap-title-word',
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.12 }
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
          '.gsap-hero-photo',
          { scale: 1.1, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
          '-=1.2'
        )
        .fromTo(
          '.gsap-stat-item',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.4'
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
          delay: 0.8,
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
    { value: stats.totalParticipants || 200, suffix: '+', label: 'Hackers' },
    { value: 18, suffix: '', label: 'Hours (4-5 Sep)' },
    { value: 15000, suffix: '', label: 'Cash Prizes (+₹50k Goodies)', prefix: '₹' },
    { value: 6, suffix: '', label: 'Tracks' },
  ];

  return (
    <div id="hero" ref={heroRef} className="relative min-h-screen flex flex-col justify-center pt-16">
      {/* Main hero content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[80vh]">
          {/* Left: Text */}
          <div className="space-y-8 pt-8 lg:pt-0">
            {/* Registration Deadline Tag — Site theme matched */}
            <div className="gsap-title-word flex flex-wrap items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-orange-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
              <span>4 Sep 6:00 PM – 5 Sep 12:00 PM</span>
              <span className="text-neutral-600 font-normal">|</span>
              <span className="text-neutral-300 font-normal normal-case tracking-normal">
                AB02 Auditorium 1 & Auditorium 2
              </span>
            </div>

            {/* Event label */}
            <div className="gsap-title-word">
              <span
                className="text-[13px] font-mono font-medium text-neutral-500 tracking-widest uppercase block"
              >
                Data Science Club · VIT Bhopal
              </span>
            </div>

            {/* Massive title */}
            <div className="space-y-0 overflow-hidden">
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="gsap-title-word block">ORIGIN</span>
                <span className="gsap-title-word block text-orange-500">OVERNIGHT</span>
                <span className="gsap-title-word block">HACKATHON</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="gsap-tagline text-base lg:text-lg text-neutral-400 max-w-md leading-relaxed">
              18 hours of non-stop innovation. AB02 Auditorium 1 & Auditorium 2. Build cutting-edge projects evaluated by <span className="text-white font-semibold">Shreyians Coding Academy</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-btn-register-team"
                onClick={() => onNavigate('register')}
                className="gsap-cta btn-primary"
              >
                Register Your Team
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-btn-schedule"
                onClick={() => onNavigate('schedule')}
                className="gsap-cta btn-outline"
              >
                View Schedule
              </button>
            </div>
          </div>

          {/* Right: Photo */}
          <div className="gsap-hero-photo relative overflow-hidden lg:h-[70vh] h-[50vh]">
            <img
              src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"
              alt="Hackers collaborating at a workspace"
              className="w-full h-full object-cover"
            />
            {/* Photo overlay text */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                AB02 Auditorium 1 & Auditorium 2 · VIT Bhopal Campus
              </span>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 border-t border-neutral-800 mt-12">
          {statItems.map((item, i) => (
            <div
              key={i}
              className="gsap-stat-item py-8 px-4 md:px-6 border-r border-neutral-800 last:border-r-0"
            >
              <div
                className="text-3xl md:text-4xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {item.prefix && <span>{item.prefix}</span>}
                <span data-count={item.value}>0</span>
                {item.suffix && <span>{item.suffix}</span>}
              </div>
              <div className="text-[13px] text-neutral-500 mt-1 font-medium">
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

      {/* Tracks Section */}
      <div id="tracks-section" className="max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-3">
              Innovation Tracks
            </span>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Choose your arena.
            </h2>
          </div>
          <button
            onClick={() => onNavigate('schedule')}
            className="text-[13px] font-medium text-orange-500 hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            View judging criteria <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800">
          {HACKATHON_TRACKS.map((track, idx) => {
            const trackCount = stats.trackCounts[track.name] || 0;
            return (
              <button
                key={idx}
                id={`track-card-${idx}`}
                onClick={() => {
                  onSelectTrack(track.name);
                  onNavigate('register');
                }}
                className="bg-black p-8 text-left group cursor-pointer transition-colors hover:bg-neutral-950 flex flex-col justify-between min-h-[200px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-neutral-600 uppercase">
                      Track {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-600">
                      {trackCount} teams
                    </span>
                  </div>
                  <h3
                    className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors mb-3"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {track.name}
                  </h3>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[13px] font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Select track <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
