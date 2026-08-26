import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Search } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { EXTERNAL_REGISTRATION_URL } from '../data/mockData';

interface NavbarProps {
  activeTab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'jury' | 'faq';
  setActiveTab: (
    tab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'jury' | 'faq'
  ) => void;
  registeredTeamCount: number;
  hasActiveTeam: boolean;
  isAdmin: boolean;
  onOpenLogin: () => void;
  hasAnnouncement?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveTeam,
  onOpenLogin,
  hasAnnouncement = false,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('MAIN');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home' as const, label: 'MAIN', scrollTo: 'hero' },
    { id: 'home' as const, label: 'SPONSORS', scrollTo: 'sponsors' },
    { id: 'home' as const, label: 'SCHEDULE', scrollTo: 'timeline-section' },
    { id: 'home' as const, label: 'FAQ', scrollTo: 'faq-section' },
  ];

  // Active section scroll detection
  useEffect(() => {
    if (activeTab === 'schedule') {
      setActiveSection('SCHEDULE');
      return;
    }
    if (activeTab === 'faq') {
      setActiveSection('FAQ');
      return;
    }
    if (activeTab !== 'home') {
      setActiveSection('');
      return;
    }

    const sections = [
      { id: 'hero', label: 'MAIN' },
      { id: 'sponsors', label: 'SPONSORS' },
      { id: 'timeline-section', label: 'SCHEDULE' },
      { id: 'faq-section', label: 'FAQ' },
    ];

    const handleScroll = () => {
      const navbarHeight = hasAnnouncement ? 120 : 80;
      const scrollPos = window.scrollY + navbarHeight + 40;

      let currentActive = 'MAIN';

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPos >= top) {
            currentActive = section.label;
          }
        }
      }

      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab, hasAnnouncement]);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    setActiveSection(link.label);

    if (activeTab !== link.id) {
      setActiveTab(link.id);
    }

    setTimeout(() => {
      const el = document.getElementById(link.scrollTo);
      if (el) {
        const navbarHeight = hasAnnouncement ? 120 : 80;
        const targetTop = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      }
    }, 80);
  };

  return (
    <>
      <header
        style={{ top: hasAnnouncement ? '40px' : '0px' }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222]'
          : 'bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-[#1A1A1A]'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo — Origin Logo + DSC Logo (Logos only) */}
          <button
            onClick={() => {
              setActiveTab('home');
              setActiveSection('MAIN');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
          ><img
              src="/DSClogo.png"
              alt="Data Science Club Logo"
              className="h-9 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <img
              src="/origin-logo.png"
              alt="ORIGIN Hackathon Logo"
              className="h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
            />

          </button>

          {/* Desktop nav links — Comic catalog style uppercase tabs with red-orange underline */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => {
              const isActive =
                (activeTab === 'home' && activeSection === link.label) ||
                (link.label === 'SCHEDULE' && activeTab === 'schedule') ||
                (link.label === 'FAQ' && activeTab === 'faq');
              return (
                <button
                  key={i}
                  onClick={() => handleNavClick(link)}
                  className={`font-heading text-[15px] tracking-widest uppercase transition-all duration-200 cursor-pointer relative py-1 ${isActive
                    ? 'text-[#FF3B00] font-bold border-b-2 border-[#FF3B00] drop-shadow-[0_2px_8px_rgba(255,59,0,0.4)]'
                    : 'text-neutral-300 hover:text-white'
                    }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {hasActiveTeam && (
              <button
                onClick={() => {
                  setActiveTab('team');
                  setActiveSection('');
                }}
                className={`hidden sm:inline-flex font-heading text-[14px] tracking-wider transition-colors cursor-pointer uppercase ${activeTab === 'team' ? 'text-[#FF3B00] font-bold' : 'text-neutral-300 hover:text-[#FF3B00]'
                  }`}
              >
                My Pass
              </button>
            )}

            {/* External Registration Pill Button */}
            <button
              onClick={() => window.open(EXTERNAL_REGISTRATION_URL, '_blank')}
              className="hidden md:inline-flex filter-pill cursor-pointer"
            >
              REGISTER &gt;
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="font-heading text-[14px] tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase"
                >
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 rounded-full border border-[#FF3B00]',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1 text-[#FFFFFF] cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6 text-[#FF3B00]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{ paddingTop: hasAnnouncement ? '8rem' : '6rem' }}
          className="fixed inset-0 z-40 bg-[#0A0A0A] px-6 md:hidden overflow-y-auto"
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => {
              const isActive =
                (activeTab === 'home' && activeSection === link.label) ||
                (link.label === 'SCHEDULE' && activeTab === 'schedule') ||
                (link.label === 'FAQ' && activeTab === 'faq');
              return (
                <button
                  key={i}
                  onClick={() => handleNavClick(link)}
                  className={`text-left font-display text-3xl py-3 border-b border-[#222222] cursor-pointer transition-all ${isActive
                    ? 'text-[#FF3B00] font-bold border-l-4 border-l-[#FF3B00] pl-3'
                    : 'text-white hover:text-[#FF3B00]'
                    }`}
                >
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={() => { window.open(EXTERNAL_REGISTRATION_URL, '_blank'); setMobileOpen(false); }}
              className="text-left font-display text-3xl text-[#FF3B00] py-3 border-b border-[#222222] cursor-pointer"
            >
              REGISTER NOW &gt;
            </button>
            {hasActiveTeam && (
              <button
                onClick={() => { setActiveTab('team'); setActiveSection(''); setMobileOpen(false); }}
                className="text-left font-display text-3xl text-neutral-400 py-3 border-b border-[#222222] cursor-pointer"
              >
                MY DIGITAL PASS
              </button>
            )}
            <button
              onClick={() => { setActiveTab('submit'); setActiveSection(''); setMobileOpen(false); }}
              className="text-left font-display text-3xl text-neutral-400 py-3 border-b border-[#222222] cursor-pointer"
            >
              SUBMIT PROJECT
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

