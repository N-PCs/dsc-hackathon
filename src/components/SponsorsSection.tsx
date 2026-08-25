import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

interface Sponsor {
  name: string;
  category: 'title' | 'gold' | 'community';
  tagline: string;
}

const SPONSORS: Sponsor[] = [
  {
    name: 'ApexCloud AI',
    category: 'title',
    tagline: 'Official Cloud Partner — $25,000 GPU Credits',
  },
  {
    name: 'Nexus ML',
    category: 'title',
    tagline: 'Deep Learning Infrastructure & Compute',
  },
  {
    name: 'DevForge Systems',
    category: 'gold',
    tagline: 'Developer API & DB Platform',
  },
  {
    name: 'CyberShield Sec',
    category: 'gold',
    tagline: 'Security & Identity Operations',
  },
  {
    name: 'QuantVenture Capital',
    category: 'gold',
    tagline: 'Incubation & Seed Investment Fund',
  },
  {
    name: 'GlobalTech DAO',
    category: 'community',
    tagline: 'Open Source Community Partner',
  },
];

export const SponsorsSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-sponsor',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const titleSponsors = SPONSORS.filter((s) => s.category === 'title');
  const goldSponsors = SPONSORS.filter((s) => s.category === 'gold');
  const communitySponsors = SPONSORS.filter((s) => s.category === 'community');

  return (
    <section id="sponsors" ref={containerRef} className="py-24 border-t-3 border-[#FF5F00] bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[13px] font-mono text-[#FF5F00] uppercase tracking-wider block mb-2 font-bold">
            Partners & Sponsors
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-[#FF5F00] comic-title max-w-xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Backed by industry leaders.
          </h2>
        </div>

        {/* Title Sponsors — Large cards */}
        <div className="mb-10">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-4 font-bold">
            Title Sponsors
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {titleSponsors.map((sponsor, idx) => (
              <div
                key={idx}
                className="gsap-sponsor comic-card p-8 md:p-12 flex flex-col justify-between min-h-[220px] bg-[#0D0E12]"
              >
                <div>
                  {/* Brand logo placeholder box */}
                  <div className="w-16 h-16 border-3 border-[#FF5F00] bg-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_#000]">
                    <span
                      className="text-xl font-extrabold text-[#FF5F00]"
                      style={{ fontFamily: 'var(--font-subheading)' }}
                    >
                      {sponsor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <h3
                    className="text-2xl font-bold text-[#FFC599] mb-2 font-subheading uppercase"
                  >
                    {sponsor.name}
                  </h3>
                  <p className="text-[13px] text-neutral-400 font-body font-bold">{sponsor.tagline}</p>
                </div>
                <div className="mt-6 text-[10px] font-mono text-[#FF5F00] font-bold uppercase tracking-wider">
                  Title Partner
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold Partners */}
        <div className="mb-10">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-4 mt-12 font-bold">
            Gold Partners
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {goldSponsors.map((sponsor, idx) => (
              <div
                key={idx}
                className="gsap-sponsor comic-card p-6 bg-[#0D0E12] flex flex-col justify-between"
              >
                <div>
                  {/* Logo box */}
                  <div className="w-12 h-12 border-2 border-[#FF5F00] bg-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_#000]">
                    <span className="text-sm font-extrabold text-[#FF5F00]" style={{ fontFamily: 'var(--font-subheading)' }}>
                      {sponsor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <h4
                    className="text-[16px] font-bold text-[#FFC599] mb-1 font-subheading uppercase"
                  >
                    {sponsor.name}
                  </h4>
                  <p className="text-[12px] text-neutral-400 font-body font-bold">{sponsor.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Partners */}
        {communitySponsors.length > 0 && (
          <div className="mt-12">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block mb-4 font-bold">
              Community Partners
            </span>
            <div className="flex flex-wrap gap-4">
              {communitySponsors.map((sponsor, idx) => (
                <div key={idx} className="gsap-sponsor flex items-center gap-3 bg-neutral-950 border-2 border-[#FF5F00] py-2.5 px-4 shadow-[3px_3px_0px_#000]">
                  <div className="w-7 h-7 border border-[#FF5F00] bg-black flex items-center justify-center">
                    <span className="text-[10px] font-extrabold text-[#FF5F00]" style={{ fontFamily: 'var(--font-subheading)' }}>
                      {sponsor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#FFC599] font-mono font-bold uppercase">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Become a sponsor CTA */}
        <div className="mt-16 pt-8 border-t-2 border-[#FF5F00] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4
              className="text-2xl font-bold text-white font-subheading"
            >
              Interested in sponsoring ORIGIN '26?
            </h4>
            <p className="text-[13px] text-neutral-400 font-body font-bold">
              Get your brand in front of 200+ student innovators, data scientists, and builders.
            </p>
          </div>
          <a
            href="mailto:dsc.origin@vitbhopal.ac.in"
            className="btn-comic-outline text-[12px] py-2 px-5 whitespace-nowrap"
          >
            Request Prospectus
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5F00]" />
          </a>
        </div>
      </div>
    </section>
  );
};
