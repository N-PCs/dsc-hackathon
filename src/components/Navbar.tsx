import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { OriginLogo } from './OriginLogo';

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
  const [activeSection, setActiveSection] = useState('About');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home' as const, label: 'About', scrollTo: 'hero' },
    { id: 'home' as const, label: 'Schedule', scrollTo: 'timeline-section' },
    { id: 'home' as const, label: 'Tracks', scrollTo: 'tracks-section' },
    { id: 'home' as const, label: 'Sponsors', scrollTo: 'sponsors' },
    { id: 'home' as const, label: 'FAQ', scrollTo: 'faq-section' },
  ];

  // Active section scroll detection
  useEffect(() => {
    if (activeTab !== 'home') {
      setActiveSection('');
      return;
    }

    const sections = [
      { id: 'hero', label: 'About' },
      { id: 'timeline-section', label: 'Schedule' },
      { id: 'tracks-section', label: 'Tracks' },
      { id: 'sponsors', label: 'Sponsors' },
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
<<<<<<< HEAD
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-black/95 border-b-3 border-[#FF5F00] py-2'
            : 'bg-transparent border-b-3 border-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo — Custom Distressed Logo Box */}
=======
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#080C14]/90 backdrop-blur-sm border-b border-neutral-800'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
          {/* Logo — DSC Logo + Text */}
>>>>>>> upstream/master
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
<<<<<<< HEAD
            className="flex items-center gap-1.5 cursor-pointer group bg-black py-1 px-3 border-2 border-[#FF5F00] shadow-[2px_2px_0px_#000]"
          >
            <OriginLogo size="sm" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F00] mt-3 group-hover:scale-125 transition-transform" />
=======
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src="/DSClogo.png"
              alt="Data Science Club Logo"
              className="h-12 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex items-center gap-0.5">
              <span className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                ORIGIN
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-600 mt-2 group-hover:scale-125 transition-transform" />
            </div>
>>>>>>> upstream/master
          </button>

          {/* Desktop nav links (strictly soft orange text) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link)}
<<<<<<< HEAD
                className={`text-[12px] uppercase font-bold tracking-wider transition-colors cursor-pointer relative font-mono ${
                  activeTab === 'home' && activeSection === link.label
                    ? 'text-[#FF5F00] border-b-2 border-[#FF5F00] pb-1'
                    : 'text-neutral-400 hover:text-[#FF5F00]'
                }`}
=======
                className={`text-[13px] font-medium transition-colors cursor-pointer relative ${activeTab === 'home' && activeSection === link.label
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-white'
                  }`}
>>>>>>> upstream/master
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side (no white elements) */}
          <div className="flex items-center gap-4">
            {hasActiveTeam && (
              <button
                onClick={() => setActiveTab('team')}
                className="hidden sm:inline-flex text-[12px] font-mono uppercase tracking-wider font-bold text-neutral-400 hover:text-[#FF5F00] transition-colors cursor-pointer"
              >
                My Pass
              </button>
            )}

            <button
              onClick={() => setActiveTab('register')}
<<<<<<< HEAD
              className="hidden sm:inline-flex btn-comic-primary py-2 px-5 text-xs"
=======
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[13px] font-semibold transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
>>>>>>> upstream/master
            >
              Register
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="text-[12px] font-mono uppercase tracking-wider font-bold text-neutral-400 hover:text-[#FF5F00] transition-colors cursor-pointer"
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
                    avatarBox: 'w-8 h-8 rounded-full border-2 border-[#FF5F00]',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-[#FF5F00] border-2 border-[#FF5F00] bg-black hover:text-[#FF8700] cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu - Solid black pane, no white */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden flex flex-col border-r-3 border-[#FF5F00]">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link)}
                className="text-left text-3xl font-bold text-[#FFC599] py-4 border-b-2 border-neutral-900 cursor-pointer"
                style={{ fontFamily: 'var(--font-subheading)', textTransform: 'uppercase' }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setActiveTab('register'); setMobileOpen(false); }}
<<<<<<< HEAD
              className="text-left text-3xl font-bold text-[#FF5F00] py-4 border-b-2 border-neutral-900 cursor-pointer"
              style={{ fontFamily: 'var(--font-subheading)', textTransform: 'uppercase' }}
=======
              className="text-left text-2xl font-bold text-orange-500 py-3 border-b border-neutral-800 cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
>>>>>>> upstream/master
            >
              Register →
            </button>
            {hasActiveTeam && (
              <button
                onClick={() => { setActiveTab('team'); setMobileOpen(false); }}
                className="text-left text-2xl font-bold text-neutral-400 py-3 border-b border-neutral-850 cursor-pointer font-mono"
              >
                My Pass
              </button>
            )}
            <button
              onClick={() => { setActiveTab('submit'); setMobileOpen(false); }}
              className="text-left text-2xl font-bold text-neutral-400 py-3 border-b border-neutral-850 cursor-pointer font-mono"
            >
              Submit Project
            </button>
          </nav>
        </div>
      )}
    </>
  );
};
