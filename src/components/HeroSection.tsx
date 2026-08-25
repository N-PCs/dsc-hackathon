import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { HackathonStats, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
<<<<<<< HEAD
import { OriginSun } from './OriginSun';
import { OriginLogo } from './OriginLogo';
=======
import { SponsorsSection } from './SponsorsSection';
>>>>>>> upstream/master

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

      tl.fromTo(
        '.gsap-title-word',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15 }
      )
        .fromTo(
          '.gsap-tagline',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          '.gsap-cta',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(
          '.gsap-hero-photo',
          { scale: 1.05, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.8'
        )
        .fromTo(
          '.gsap-stat-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.4'
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP count animations
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
    { value: 24, suffix: '', label: 'Hours' },
    { value: 150000, suffix: '', label: 'In Prizes (₹)', prefix: '₹' },
    { value: 6, suffix: '', label: 'Tracks' },
  ];

  return (
    <div id="hero" ref={heroRef} className="relative min-h-screen flex flex-col pt-16 bg-black overflow-x-hidden">
      
      {/* Sun positioned near the top, behind title, fully visible */}
      <div className="absolute top-0 left-0 right-0 h-[600px] sm:h-[750px] md:h-[850px] z-0 overflow-hidden flex items-center justify-center">
        <OriginSun />
      </div>

<<<<<<< HEAD
      {/* Centered Hero Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full z-10 relative flex flex-col items-center justify-center pt-12 md:pt-20 text-center">
        
        {/* Label */}
        <div className="gsap-title-word mb-6">
          <span className="text-[11px] font-mono font-bold text-[#FF5F00] tracking-widest uppercase bg-black border-2 border-[#FF5F00] py-1 px-4 inline-block shadow-[2px_2px_0px_#000]">
            Data Science Club · VIT Bhopal University
          </span>
        </div>
=======
            {/* Massive title */}
            <div className="space-y-0 overflow-hidden">
              <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="gsap-title-word block">ORIGIN</span>
                <span className="gsap-title-word block text-orange-500">OVERNIGHT</span>
                <span className="gsap-title-word block">HACKATHON</span>
              </h1>
            </div>
>>>>>>> upstream/master

        {/* Custom Distressed Logo with solar flare behind 'O' */}
        <div className="gsap-title-word flex justify-center mb-6">
          <OriginLogo size="lg" />
        </div>

        {/* Subtitle headings */}
        <div className="gsap-title-word mb-8 space-y-2">
          <h2 
            className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-wider text-[#FF5F00]"
            style={{ fontFamily: 'var(--font-subheading)', textShadow: '2px 2px 0px #000' }}
          >
            OVERNIGHT HACKATHON
          </h2>
        </div>

        {/* Tagline description in soft orange */}
        <p className="gsap-tagline text-sm sm:text-base md:text-lg text-[#FFC599] max-w-xl leading-relaxed font-body font-bold bg-black/65 p-5 border-3 border-[#FF5F00] shadow-[4px_4px_0px_#000] mb-8">
          24 hours. One venue. Build something extraordinary from scratch — 
          AI, Web3, FinTech, HealthTech, IoT, or Open Innovation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-5 mb-16">
          <button
            onClick={() => onNavigate('register')}
            className="gsap-cta btn-comic-primary px-8 py-3.5"
          >
            Register Your Team
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          <button
            onClick={() => onNavigate('schedule')}
            className="gsap-cta btn-comic-outline px-8 py-3.5"
          >
            View Schedule
          </button>
        </div>

        {/* Widescreen trailer banner */}
        <div className="gsap-hero-photo relative overflow-hidden w-full max-w-4xl aspect-[21/9] border-4 border-[#FF5F00] shadow-[8px_8px_0px_#000] mb-16">
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"
            alt="Hackers collaborating at a workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black border-t-3 border-[#FF5F00]">
            <span className="text-[11px] font-mono text-[#FFC599] uppercase tracking-wider font-extrabold">
              Auditorium AB02 · VIT Bhopal Campus Check-in
            </span>
          </div>
        </div>

        {/* Stats strip in black/orange */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 border-3 border-[#FF5F00] w-full max-w-4xl bg-[#0D0E12] shadow-[6px_6px_0px_#000] mb-24">
          {statItems.map((item, i) => (
            <div
              key={i}
              className="gsap-stat-item py-6 px-4 md:px-6 border-r-3 border-[#FF5F00] last:border-r-0 flex flex-col justify-center text-center"
            >
              <div
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#FF5F00]"
                style={{ fontFamily: 'var(--font-subheading)', textShadow: '2px 2px 0px #000' }}
              >
                {item.prefix && <span>{item.prefix}</span>}
                <span data-count={item.value}>0</span>
                {item.suffix && <span>{item.suffix}</span>}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1.5 font-mono uppercase tracking-wider font-bold">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

<<<<<<< HEAD
      {/* Normal grid layout for innovation tracks (no horizontal scrolls) */}
      <div id="tracks-section" className="py-24 border-t-3 border-[#FF5F00] bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[13px] font-mono text-[#FF5F00] uppercase tracking-wider block mb-2 font-bold">
                Innovation Tracks
              </span>
              <h2 
                className="text-4xl md:text-6xl font-bold tracking-tight text-[#FF5F00] comic-title"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Choose your arena.
              </h2>
              <p className="text-[13px] text-neutral-400 mt-2 font-body font-bold">
                Hover or Click a card below to reveal track descriptions and entry protocols.
              </p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-[13px] font-bold text-[#FF5F00] hover:text-[#FF8700] transition-colors cursor-pointer flex items-center gap-1.5 font-mono uppercase"
            >
              Judging Criteria <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid Layout of 3D cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {HACKATHON_TRACKS.map((track, idx) => (
              <TrackFlipCard
                key={idx}
                track={track}
                idx={idx}
                stats={stats}
                onNavigate={onNavigate}
                onSelectTrack={onSelectTrack}
              />
            ))}
          </div>
=======
      {/* Sponsors Section — Placed before Choose your arena */}
      <SponsorsSection />

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
>>>>>>> upstream/master
        </div>
      </div>

    </div>
  );
};

// Sub-component: 3D Flip Card for Tracks (strictly black/orange, no white)
interface TrackFlipCardProps {
  track: typeof HACKATHON_TRACKS[0];
  idx: number;
  stats: HackathonStats;
  onNavigate: (tab: 'register' | 'team' | 'submit' | 'schedule') => void;
  onSelectTrack: (track: TrackType) => void;
}

const TrackFlipCard: React.FC<TrackFlipCardProps> = ({
  track,
  idx,
  stats,
  onNavigate,
  onSelectTrack,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const trackCount = stats.trackCounts[track.name] || 0;

  return (
    <div
      className="w-full h-[320px] flip-card-container cursor-pointer select-none"
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="flip-card-inner w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        {/* Front Side */}
        <div className="flip-card-front comic-card p-8 flex flex-col justify-between h-full border-3 border-[#FF5F00] shadow-[6px_6px_0px_#000] bg-[#0D0E12]">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-neutral-850 pb-3">
              <span className="text-[12px] font-mono text-[#FF5F00] font-bold">
                TRACK {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-mono text-[#FFC599] font-bold bg-black px-2 py-0.5 border border-[#FF5F00]">
                {trackCount} TEAMS
              </span>
            </div>
            <h3
              className="text-xl font-bold text-[#FFC599] tracking-wide mt-2"
              style={{ fontFamily: 'var(--font-subheading)', textTransform: 'uppercase' }}
            >
              {track.name}
            </h3>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
            Explore Details →
          </div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back comic-card-orange p-6 flex flex-col justify-between h-full border-3 border-black shadow-[6px_6px_0px_#FFC599] bg-[#FF5F00]">
          <div className="space-y-3">
            <h4
              className="text-lg font-bold text-black border-b border-black/30 pb-2"
              style={{ fontFamily: 'var(--font-subheading)', textTransform: 'uppercase' }}
            >
              {track.name}
            </h4>
            <p className="text-[13px] text-black leading-relaxed font-body font-bold">
              {track.description}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Stop flipping
              onSelectTrack(track.name);
              onNavigate('register');
            }}
            className="w-full py-2.5 bg-black hover:bg-neutral-900 text-[#FF5F00] font-bold text-xs border-2 border-black transition-colors uppercase tracking-wider font-mono flex items-center justify-center gap-1.5"
          >
            Select Track
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5F00]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
