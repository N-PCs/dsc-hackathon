import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#080C14]/90 backdrop-blur-sm border-b border-neutral-800'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between">
          {/* Logo — DSC Logo + Origin Logo */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img
              src="/DSClogo.png"
              alt="Data Science Club Logo"
              className="h-9 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <img
              src="/origin-logo.png"
              alt="ORIGIN Hackathon Logo"
              className="h-20 md:h-20 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </button>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link)}
                className={`text-[13px] font-medium transition-colors cursor-pointer relative ${activeTab === 'home' && activeSection === link.label
                  ? 'text-white'
                  : 'text-neutral-400 hover:text-white'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {hasActiveTeam && (
              <button
                onClick={() => setActiveTab('team')}
                className="hidden sm:inline-flex text-[13px] text-neutral-400 hover:text-white transition-colors cursor-pointer font-medium"
              >
                My Pass
              </button>
            )}

            <button
              onClick={() => setActiveTab('register')}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[13px] font-semibold transition-colors cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Register
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="text-[13px] text-neutral-400 hover:text-white transition-colors cursor-pointer font-medium"
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
                    avatarBox: 'w-8 h-8 rounded-full',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1 text-white cursor-pointer"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#080C14] pt-20 px-6 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link)}
                className="text-left text-2xl font-bold text-white py-3 border-b border-neutral-800 cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => { setActiveTab('register'); setMobileOpen(false); }}
              className="text-left text-2xl font-bold text-orange-500 py-3 border-b border-neutral-800 cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Register →
            </button>
            {hasActiveTeam && (
              <button
                onClick={() => { setActiveTab('team'); setMobileOpen(false); }}
                className="text-left text-2xl font-bold text-neutral-400 py-3 border-b border-neutral-800 cursor-pointer"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                My Pass
              </button>
            )}
            <button
              onClick={() => { setActiveTab('submit'); setMobileOpen(false); }}
              className="text-left text-2xl font-bold text-neutral-400 py-3 border-b border-neutral-800 cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Submit Project
            </button>
          </nav>
        </div>
      )}
    </>
  );
};
