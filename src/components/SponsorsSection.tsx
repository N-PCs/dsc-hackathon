import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';

interface Sponsor {
  name: string;
  category: 'title' | 'gold' | 'community';
  logo?: string;
}

interface Partner {
  name: string;
  logo: string;
  className?: string;
}

const INSTITUTIONAL_PARTNERS: Partner[] = [
  {
    name: 'VIT Bhopal University',
    logo: '/Collegelogo.png',
    className: 'max-h-14 sm:max-h-16 md:max-h-20 max-w-[140px] sm:max-w-[180px] object-contain',
  },
  {
    name: "Institution's Innovation Council",
    logo: '/IIC Logo.png',
    className: 'max-h-14 sm:max-h-16 md:max-h-20 max-w-[140px] sm:max-w-[180px] object-contain',
  },
  {
    name: 'Student Welfare Office',
    logo: '/SW Office Logo Light.png',
    className: 'max-h-14 sm:max-h-16 md:max-h-20 max-w-[150px] sm:max-w-[200px] object-contain',
  },
  {
    name: 'Data Science Club',
    logo: '/DSClogo.png',
    className: 'max-h-14 sm:max-h-16 md:max-h-20 max-w-[140px] sm:max-w-[180px] object-contain',
  },
];

const SPONSORS: Sponsor[] = [
  {
    name: 'Sheryians Coding School',
    category: 'title',
    logo: '/sponsors/Sheryians logo white.png',
  },
  {
    name: 'Too Yumm!',
    category: 'title',
    logo: '/sponsors/tooyumm.png',
  },
  {
    name: 'Kavita Sales',
    category: 'title',
    logo: '/sponsors/kavitasales.png',
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
    <section id="sponsors" ref={containerRef} className="py-20 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Section Header */}
        <div className="mb-14 border-b border-[#222222] pb-6">
          <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-2 font-bold">
            PARTNERS & SPONSORS CATALOG
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-white uppercase tracking-wider max-w-lg">
            BACKED BY INDUSTRY LEADERS.
          </h2>
        </div>

        {/* Title Sponsors — Side by side comic cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {titleSponsors.map((sponsor, idx) => (
            <div
              key={idx}
              className="gsap-sponsor bg-[#141414] border border-[#262626] p-8 flex flex-col justify-between min-h-[220px] group cursor-pointer hover:border-[#FF3B00] hover:bg-[#181818] transition-all relative"
            >
              <div className="tape-strip" />
              <div>
                <div className="h-16 flex items-center mb-6 border-b border-[#222222] pb-4">
                  {sponsor.logo ? (
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-h-14 max-w-[220px] object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-16 h-16 border border-[#262626] flex items-center justify-center bg-black">
                      <span className="font-display text-2xl text-white group-hover:text-[#FF3B00] transition-colors">
                        {sponsor.name.split(' ').map((w) => w[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-display text-2xl text-white group-hover:text-[#FF3B00] transition-colors mb-2">
                  {sponsor.name}
                </h3>
              </div>
              <div className="mt-4 font-heading text-xs text-[#FF3B00] font-bold uppercase tracking-widest">
                {sponsor.name.toLowerCase().includes('sheryians') || sponsor.name.toLowerCase().includes('shreyians')
                  ? 'OFFICIAL JUDGES & SPONSOR'
                  : 'OFFICIAL SPONSOR'}
              </div>
            </div>
          ))}
        </div>

        {/* Institutional & University Partners Strip */}
        <div className="bg-[#141414] border border-[#262626] p-6 sm:p-10 relative">
          <div className="tape-strip-left" />
          <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-6 text-center sm:text-left font-bold">
            INSTITUTIONAL & UNIVERSITY PARTNERS
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
            {INSTITUTIONAL_PARTNERS.map((partner, idx) => (
              <div
                key={idx}
                className="gsap-sponsor flex flex-col items-center justify-center p-4 group border border-[#222222] bg-black hover:border-[#FF3B00]/50 transition-colors min-h-[140px] sm:min-h-[160px]"
              >
                <div className="h-16 sm:h-20 md:h-24 w-full flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={`${partner.className} filter brightness-95 group-hover:brightness-110 group-hover:scale-105 transition-all duration-300`}
                  />
                </div>
                <span className="font-heading text-[11px] sm:text-xs text-neutral-300 mt-2 text-center uppercase tracking-wider font-bold leading-tight">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Become a sponsor CTA */}
        <div className="mt-16 pt-8 border-t border-[#222222] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-2xl text-white">
              INTERESTED IN SPONSORING ORIGIN '26?
            </h4>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Get your brand in front of 200+ student innovators, data scientists, and builders.
            </p>
          </div>
          <a
            href="mailto:dsc.vitb@vitbhopal.ac.in"
            className="btn-outline text-xs whitespace-nowrap w-full sm:w-auto justify-center"
          >
            REQUEST PROSPECTUS &gt;
          </a>
        </div>
      </div>
    </section>
  );
};

