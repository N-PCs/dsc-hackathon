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
    <section id="sponsors" ref={containerRef} className="py-24 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-3">
            Partners & Sponsors
          </span>
          <h2
            className="text-3xl md:text-5xl font-bold tracking-tight max-w-lg"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Backed by industry leaders.
          </h2>
        </div>

        {/* Title Sponsors — Large cards */}
        <div className="mb-2">
          <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider block mb-4">
            Title Sponsors
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800">
            {titleSponsors.map((sponsor, idx) => (
              <div
                key={idx}
                className="gsap-sponsor bg-black p-10 md:p-14 flex flex-col justify-between min-h-[220px] group cursor-pointer hover:bg-neutral-950 transition-colors"
              >
                <div>
                  {/* Placeholder logo area */}
                  <div className="w-16 h-16 border border-neutral-700 flex items-center justify-center mb-6">
                    <span
                      className="text-lg font-bold text-neutral-600 group-hover:text-blue-500 transition-colors"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {sponsor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <h3
                    className="text-2xl font-bold text-white mb-2 group-hover:text-blue-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {sponsor.name}
                  </h3>
                  <p className="text-[14px] text-neutral-500">{sponsor.tagline}</p>
                </div>
                <div className="mt-4 text-[11px] font-mono text-neutral-600 uppercase">
                  Title Partner
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gold Partners */}
        <div className="mb-2">
          <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider block mb-4 mt-12">
            Gold Partners
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-800">
            {goldSponsors.map((sponsor, idx) => (
              <div
                key={idx}
                className="gsap-sponsor bg-black p-8 group cursor-pointer hover:bg-neutral-950 transition-colors"
              >
                {/* Placeholder logo */}
                <div className="w-12 h-12 border border-neutral-800 flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-neutral-600" style={{ fontFamily: 'var(--font-heading)' }}>
                    {sponsor.name.split(' ').map(w => w[0]).join('')}
                  </span>
                </div>
                <h4
                  className="text-[15px] font-bold text-white mb-1 group-hover:text-blue-500 transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {sponsor.name}
                </h4>
                <p className="text-[12px] text-neutral-500">{sponsor.tagline}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Partners — compact strip */}
        {communitySponsors.length > 0 && (
          <div className="mt-12">
            <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider block mb-4">
              Community Partners
            </span>
            <div className="flex flex-wrap gap-6">
              {communitySponsors.map((sponsor, idx) => (
                <div key={idx} className="gsap-sponsor flex items-center gap-3">
                  <div className="w-8 h-8 border border-neutral-800 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-neutral-600" style={{ fontFamily: 'var(--font-heading)' }}>
                      {sponsor.name.split(' ').map(w => w[0]).join('')}
                    </span>
                  </div>
                  <span className="text-[13px] text-neutral-400 font-medium">{sponsor.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Become a sponsor CTA */}
        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4
              className="text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Interested in sponsoring ORIGIN '26?
            </h4>
            <p className="text-[13px] text-neutral-500 mt-1">
              Get your brand in front of 200+ student innovators, data scientists, and builders.
            </p>
          </div>
          <a
            href="mailto:dsc.origin@vitbhopal.ac.in"
            className="btn-outline text-[13px] whitespace-nowrap"
          >
            Request Prospectus
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
