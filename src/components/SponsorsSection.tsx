import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

interface Sponsor {
  name: string;
  category: 'title' | 'gold' | 'community';
  tagline: string;
  logo?: string;
}

interface Partner {
  name: string;
  logo: string;
  className?: string;
}

const INSTITUTIONAL_PARTNERS: Partner[] = [
  { name: 'VIT Bhopal University', logo: '/Collegelogo.png' },
  { name: "Institution's Innovation Council", logo: '/IIC Logo.png' },
  {
    name: 'Student Welfare Office',
    logo: '/SW Office Logo Light.png',
    className:
      'max-h-16 sm:max-h-24 md:max-h-32 max-w-[140px] sm:max-w-[240px] md:max-w-[300px] scale-110 sm:scale-125 md:scale-135 object-contain filter brightness-95 group-hover:brightness-110 group-hover:scale-125 md:group-hover:scale-140 transition-all duration-300',
  },
  { name: 'Data Science Club', logo: '/DSClogo.png' },
];

const SPONSORS: Sponsor[] = [
  {
    name: 'Sheryians Coding School',
    category: 'title',
    tagline: 'Official Upskilling & Coding Education Partner',
    logo: '/sponsors/Sheryians logo white.png',
  },
  {
    name: 'Too Yumm!',
    category: 'title',
    tagline: 'Official Munchies & Energy Partner',
    logo: '/sponsors/tooyumm.png',
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

  return (
<<<<<<< HEAD
    <section id="sponsors" ref={containerRef} className="py-24 border-t-3 border-[#FF5F00] bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-[13px] font-mono text-[#FF5F00] uppercase tracking-wider block mb-2 font-bold">
            Partners & Sponsors
          </span>
          <h2
            className="text-4xl md:text-6xl font-bold tracking-tight text-[#FF5F00] comic-title max-w-xl"
=======
    <section id="sponsors" ref={containerRef} className="py-12 md:py-24 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Header */}
        <div className="mb-8 md:mb-14">
          <span className="text-[11px] sm:text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-2 sm:mb-3">
            Partners & Sponsors
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight max-w-lg"
>>>>>>> upstream/master
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Backed by industry leaders.
          </h2>
        </div>

<<<<<<< HEAD
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
=======
        {/* Title Sponsors — Side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800 mb-10 md:mb-16">
          {titleSponsors.map((sponsor, idx) => (
            <div
              key={idx}
              className="gsap-sponsor bg-black p-6 sm:p-10 md:p-14 flex flex-col justify-between min-h-[180px] sm:min-h-[240px] group cursor-pointer hover:bg-neutral-950 transition-colors"
            >
              <div>
                <div className="h-12 sm:h-16 flex items-center mb-4 sm:mb-6">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-12 sm:max-h-16 max-w-[180px] sm:max-w-[240px] object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-12 sm:w-16 h-12 sm:h-16 border border-neutral-700 flex items-center justify-center">
                      <span
                        className="text-base sm:text-lg font-bold text-neutral-600 group-hover:text-orange-500 transition-colors"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {sponsor.name.split(' ').map((w) => w[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <h3
                  className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 group-hover:text-orange-500 transition-colors"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {sponsor.name}
                </h3>
                <p className="text-xs sm:text-[14px] text-neutral-500 leading-relaxed">{sponsor.tagline}</p>
              </div>
              <div className="mt-4 sm:mt-6 text-[10px] sm:text-[11px] font-mono text-orange-500 font-semibold uppercase tracking-wider">
                Official Title Partner
              </div>
            </div>
          ))}
        </div>

        {/* Institutional & University Partners Strip */}
        <div className="bg-black/40 border border-neutral-800 p-4 sm:p-8 md:p-10 rounded-2xl">
          <span className="text-[10px] sm:text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-4 sm:mb-6 text-center sm:text-left">
            Institutional & University Partners
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 items-center">
            {INSTITUTIONAL_PARTNERS.map((partner, idx) => (
              <div key={idx} className="gsap-sponsor flex flex-col items-center justify-center p-1.5 sm:p-3 group">
                <div className="h-16 sm:h-24 md:h-28 flex items-center justify-center overflow-visible">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={
                      partner.className ||
                      'max-h-12 sm:max-h-18 md:max-h-22 max-w-[120px] sm:max-w-[180px] md:max-w-[220px] object-contain filter brightness-95 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300'
                    }
                  />
                </div>
                <span className="text-[10px] sm:text-[12px] font-mono text-neutral-300 mt-2 sm:mt-4 text-center font-medium leading-tight">
                  {partner.name}
                </span>
>>>>>>> upstream/master
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Become a sponsor CTA */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4
              className="text-base sm:text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Interested in sponsoring ORIGIN '26?
            </h4>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-1">
>>>>>>> upstream/master
              Get your brand in front of 200+ student innovators, data scientists, and builders.
            </p>
          </div>
          <a
            href="mailto:dsc.origin@vitbhopal.ac.in"
<<<<<<< HEAD
            className="btn-comic-outline text-[12px] py-2 px-5 whitespace-nowrap"
=======
            className="btn-outline text-xs sm:text-[13px] whitespace-nowrap w-full sm:w-auto justify-center"
>>>>>>> upstream/master
          >
            Request Prospectus
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5F00]" />
          </a>
        </div>
      </div>
    </section>
  );
};
