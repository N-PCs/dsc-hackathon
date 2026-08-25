import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Search } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  activeTab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'jury' | 'faq';
  setActiveTab: (
    tab: 'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'jury' | 'faq'
  ) => void;
  registeredTeamCount: number;
  hasActiveTeam: boolean;
  isAdmin: boolean;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveTeam,
  onOpenLogin,
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
    { id: 'home' as const, label: 'ARENAS', scrollTo: 'tracks-section' },
    { id: 'home' as const, label: 'SCHEDULE', scrollTo: 'timeline-section' },
    { id: 'home' as const, label: 'FAQ', scrollTo: 'faq-section' },
  ];

  // Active section scroll detection
  useEffect(() => {
    if (activeTab !== 'home') {
      setActiveSection('');
      return;
    }

    const sections = [
      { id: 'hero', label: 'MAIN' },
      { id: 'sponsors', label: 'SPONSORS' },
      { id: 'tracks-section', label: 'ARENAS' },
      { id: 'timeline-section', label: 'SCHEDULE' },
      { id: 'faq-section', label: 'FAQ' },
    ];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200; // Offset for navbar height

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section.label);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init

    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    setActiveTab(link.id);
    setTimeout(() => {
      const el = document.getElementById(link.scrollTo);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222]'
          : 'bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-[#1A1A1A]'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo — Origin Logo + DSC Logo (Logos only) */}
          <button
            onClick={() => {
              setActiveTab('home');
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
              const isActive = activeTab === 'home' && activeSection === link.label;
              return (
                <button
                  key={i}
                  onClick={() => handleNavClick(link)}
                  className={`font-heading text-[15px] tracking-widest uppercase transition-all cursor-pointer relative py-1 ${isActive
                    ? 'text-[#FF3B00] font-bold border-b-2 border-[#FF3B00]'
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
                onClick={() => setActiveTab('team')}
                className="hidden sm:inline-flex font-heading text-[14px] tracking-wider text-neutral-300 hover:text-[#FF3B00] transition-colors cursor-pointer uppercase"
              >
                My Pass
              </button>
            )}

            {/* Filter / Register Pill Button matching the reference image */}
            <button
              onClick={() => setActiveTab('register')}
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
              className="md:hidden p-1 text-white cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6 text-[#FF3B00]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0A] pt-24 px-6 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link)}
                className="text-left font-display text-3xl text-white py-3 border-b border-[#222222] cursor-pointer hover:text-[#FF3B00] transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setActiveTab('register'); setMobileOpen(false); }}
              className="text-left font-display text-3xl text-[#FF3B00] py-3 border-b border-[#222222] cursor-pointer"
            >
              REGISTER NOW &gt;
            </button>
            {hasActiveTeam && (
              <button
                onClick={() => { setActiveTab('team'); setMobileOpen(false); }}
                className="text-left font-display text-3xl text-neutral-400 py-3 border-b border-[#222222] cursor-pointer"
              >
                MY DIGITAL PASS
              </button>
            )}
            <button
              onClick={() => { setActiveTab('submit'); setMobileOpen(false); }}
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

