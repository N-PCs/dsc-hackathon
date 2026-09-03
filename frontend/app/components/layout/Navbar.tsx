"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, Shield, ChevronDown, Lock, Send } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useTeams } from "@/context/TeamsContext";

interface NavbarProps {
  activeTab: string;
  hasActiveTeam: boolean;
  hasAnnouncement: boolean;
  registeredTeamCount: number;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  hasActiveTeam,
  hasAnnouncement,
  registeredTeamCount,
  onOpenLogin,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { activeTeam, clearActiveTeam, submissionsOpen: isSubmissionsOpen } = useTeams();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isJury, setIsJury] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check user roles (admin / jury)
  useEffect(() => {
    const checkRoles = () => {
      // Check jury
      const jury = localStorage.getItem("origin_jury_auth") === "true";
      setIsJury(jury);

      // Check admin
      let admin = false;
      if (user?.email) {
        const adminWhitelist = localStorage.getItem("origin_admin_whitelist");
        if (adminWhitelist) {
          try {
            const whitelist = JSON.parse(adminWhitelist);
            admin = whitelist.some(
              (a: any) => a.email.toLowerCase() === user.email?.toLowerCase()
            );
          } catch (e) {
            // ignore
          }
        }
      }
      setIsAdmin(admin);
    };
    checkRoles();
    // Re-check when user changes or localStorage updates
    const handleStorageChange = () => checkRoles();
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  // Scroll spy for homepage
  useEffect(() => {
    if (pathname !== "/") return;
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 160;
      const sections = [
        { id: "faq-section", label: "FAQ" },
        { id: "timeline-section", label: "SCHEDULE" },
        { id: "sponsors", label: "SPONSORS" },
        { id: "hero", label: "MAIN" },
      ];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(s.id);
            return;
          }
        }
      }
      setActiveSection("hero");
    };
    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
  }, [pathname]);

  const handleLogoClick = () => {
    setMobileOpen(false);
    if (pathname === "/") {
      const el = document.getElementById("hero");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setActiveSection("hero");
      }
    } else {
      sessionStorage.setItem("pendingScroll", "hero");
      router.push("/");
    }
  };

  const handleNavClick = (tab: string, scrollTo?: string) => {
    setMobileOpen(false);
    if (tab === "home") {
      if (pathname === "/") {
        if (scrollTo) {
          setActiveSection(scrollTo);
          const el = document.getElementById(scrollTo);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        if (scrollTo) {
          sessionStorage.setItem("pendingScroll", scrollTo);
        }
        router.push("/");
      }
    } else {
      router.push(`/${tab}`);
    }
  };

  const handleSubmitClick = () => {
    setMobileOpen(false);
    if (!user && !hasActiveTeam) {
      setAuthModalOpen(true);
    } else {
      router.push("/submit");
    }
  };

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    setMobileOpen(false);
    await signOut();
    clearActiveTeam();
  };

  const navLinks = [
    { id: "home", label: "MAIN", scrollTo: "hero" },
    { id: "home", label: "SPONSORS", scrollTo: "sponsors" },
    { id: "home", label: "SCHEDULE", scrollTo: "timeline-section" },
    { id: "home", label: "FAQ", scrollTo: "faq-section" },
  ];

  const isActive = (linkLabel: string, scrollTo?: string) => {
    if (pathname === "/") {
      if (scrollTo) {
        return activeSection === scrollTo;
      }
      return activeSection === "hero" && linkLabel === "MAIN";
    }
    return activeTab === linkLabel.toLowerCase() || pathname === `/${linkLabel.toLowerCase()}`;
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const isAdminOrJury = isAdmin || isJury;

  return (
    <>
      <header
        style={{ top: hasAnnouncement ? "40px" : "0px" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222]"
            : "bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-[#1A1A1A]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logos */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              title="Return to Main Section"
            >
              <img
                src="/DSClogo.png"
                alt="Data Science Club Logo"
                className="h-8 sm:h-10 md:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <img
                src="/origin-logo.png"
                alt="ORIGIN Hackathon Logo"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => {
              const active = isActive(link.label, link.scrollTo);
              return (
                <button
                  key={i}
                  onClick={() => handleNavClick(link.id, link.scrollTo)}
                  className={`font-heading text-[15px] tracking-widest uppercase transition-all duration-200 cursor-pointer relative py-1.5 ${
                    active
                      ? "text-[#FF3B00] font-bold border-b-2 border-[#FF3B00] drop-shadow-[0_2px_8px_rgba(255,59,0,0.5)]"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right side: Team Name Button + Submit + Auth (Register removed) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Team Name Button with Hover Popover – only for normal users (not admin/jury) */}
            {activeTeam && !isAdminOrJury && (
              <div className="relative group hidden sm:block">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/50 border border-orange-500/40 hover:border-orange-500 text-orange-400 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  onClick={() => router.push("/team")}
                >
                  <span className="truncate max-w-[120px]">{activeTeam.teamName}</span>
                  <ChevronDown className="w-3 h-3 text-orange-400" />
                </button>

                {/* Hover Popover */}
                <div className="absolute right-0 mt-2 w-80 bg-[#0D0D0D] border border-[#262626] shadow-2xl p-4 text-white z-50 hidden group-hover:block animate-fade-in pointer-events-auto">
                  <div className="space-y-3">
                    <div className="border-b border-[#222222] pb-2">
                      <p className="font-heading text-sm font-bold text-white">{activeTeam.teamName}</p>
                      <p className="font-mono text-[10px] text-orange-400">ID: {activeTeam.id}</p>
                      <p className="font-mono text-[10px] text-neutral-400">Track: {activeTeam.track}</p>
                      <p className="font-mono text-[10px] mt-1">
                        {activeTeam.paymentStatus === "verified" ? (
                          <span className="text-emerald-400">✅ Payment Verified</span>
                        ) : (
                          <span className="text-amber-400">⏳ Payment Pending</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="font-heading text-xs text-neutral-400 uppercase tracking-wider mb-1">Team Leader</p>
                      <p className="font-mono text-xs text-white">{activeTeam.leader.name}</p>
                      <p className="font-mono text-[11px] text-neutral-400 truncate">{activeTeam.leader.email}</p>
                      <p className="font-mono text-[11px] text-neutral-400">{activeTeam.leader.phone}</p>
                      {activeTeam.leader.registrationNumber && (
                        <p className="font-mono text-[11px] text-neutral-400">Reg: {activeTeam.leader.registrationNumber}</p>
                      )}
                    </div>

                    {[activeTeam.member2, activeTeam.member3, activeTeam.member4, activeTeam.member5]
                      .filter(Boolean)
                      .map((member, idx) => (
                        <div key={idx} className="border-t border-[#222222] pt-2">
                          <p className="font-heading text-xs text-neutral-400 uppercase tracking-wider mb-1">
                            Member {idx + 2}
                          </p>
                          <p className="font-mono text-xs text-white">{member?.name}</p>
                          <p className="font-mono text-[11px] text-neutral-400 truncate">{member?.email}</p>
                          {member?.registrationNumber && (
                            <p className="font-mono text-[11px] text-neutral-400">Reg: {member.registrationNumber}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Digital Pass & Submit Project — always visible in the navbar */}
            <div className="flex items-center gap-2">
              <button
                id="nav-btn-digital-pass"
                onClick={() => {
                  if (!user && !hasActiveTeam) {
                    setAuthModalOpen(true);
                  } else {
                    router.push("/team");
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                  pathname === "/team"
                    ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                    : "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border-amber-500/40 hover:border-amber-500"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DIGITAL PASS</span>
              </button>

              {isSubmissionsOpen ? (
                <button
                  id="nav-btn-submit-project"
                  onClick={handleSubmitClick}
                  className={`inline-flex items-center gap-1.5 px-2 sm:px-3.5 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider font-bold transition-all cursor-pointer border ${
                    pathname === "/submit"
                      ? "bg-[#FF3B00] text-white border-[#FF3B00] shadow-[0_0_15px_rgba(255,59,0,0.5)]"
                      : "bg-[#FF3B00]/10 hover:bg-[#FF3B00] text-[#FF3B00] hover:text-white border-[#FF3B00]/40 hover:border-[#FF3B00]"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SUBMIT PROJECT &gt;</span>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/submit")}
                  className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-pointer hover:border-neutral-700"
                  title="Submissions currently closed by Admin"
                >
                  <Lock className="w-3 h-3 text-neutral-500" />
                  <span className="hidden sm:inline">SUBMISSION CLOSED</span>
                </button>
              )}
            </div>

            {/* Auth Button / Profile Dropdown */}
            {!loading && !user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="font-heading text-[13px] sm:text-[14px] tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase px-3 py-1.5 border border-neutral-800 hover:border-[#FF3B00] bg-[#111111]"
              >
                Sign In
              </button>
            )}

            {!loading && user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-[#FF3B00] hover:scale-105 transition-all cursor-pointer bg-[#171717]"
                  title={user.email || "User Profile"}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#FF3B00] text-white flex items-center justify-center font-mono text-xs font-bold">
                      {getUserInitials()}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 mr-1 hidden sm:block" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-[#0D0D0D] border border-[#262626] shadow-2xl p-4 text-white z-50 space-y-3 animate-fade-in"
                    style={{
                      boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(255,59,0,0.1)",
                    }}
                  >
                    <div className="border-b border-[#222222] pb-3">
                      <p className="font-heading text-sm text-white font-bold truncate">
                        {user.displayName || "Origin Participant"}
                      </p>
                      <p className="font-mono text-[11px] text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="space-y-1 font-mono text-xs">
                      {/* Admin Console – only for admins */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/admin");
                          }}
                          className="w-full text-left px-2.5 py-2 hover:bg-[#171717] hover:text-[#FF3B00] transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      {/* Jury Console – only for jury members */}
                      {isJury && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            router.push("/jury");
                          }}
                          className="w-full text-left px-2.5 py-2 hover:bg-[#171717] hover:text-[#FF3B00] transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Jury Console</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          router.push("/team");
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-[#171717] hover:text-[#FF3B00] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>My Digital Pass</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          router.push("/submit");
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-[#171717] hover:text-[#FF3B00] transition-colors flex items-center gap-2 cursor-pointer text-[#FF3B00]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Project Submission</span>
                      </button>
                    </div>

                    <div className="border-t border-[#222222] pt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-2.5 py-2 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-mono text-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1 text-[#FFFFFF] cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6 text-[#FF3B00]" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          style={{ paddingTop: hasAnnouncement ? "8rem" : "6rem" }}
          className="fixed inset-0 z-40 bg-[#0A0A0A] px-6 md:hidden overflow-y-auto"
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => {
              const active = isActive(link.label, link.scrollTo);
              return (
                <button
                  key={i}
                  onClick={() => handleNavClick(link.id, link.scrollTo)}
                  className={`text-left font-display text-3xl py-3 border-b border-[#222222] cursor-pointer transition-all ${
                    active
                      ? "text-[#FF3B00] font-bold border-l-4 border-l-[#FF3B00] pl-3 bg-[#FF3B00]/10"
                      : "text-white hover:text-[#FF3B00]"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Mobile: Team Name + Submit (hidden for Admin/Jury) */}
            {activeTeam && !isAdminOrJury && (
              <div className="py-3 border-b border-[#222222]">
                <div className="text-left font-display text-2xl text-orange-400 mb-1">
                  {activeTeam.teamName}
                </div>
                <div className="text-xs font-mono text-neutral-400">
                  {activeTeam.leader.name} • {activeTeam.id}
                </div>
              </div>
            )}

            {isSubmissionsOpen ? (
              <div className="py-3 border-b border-[#222222]">
                <button
                  onClick={handleSubmitClick}
                  className="text-left font-display text-3xl text-orange-400 cursor-pointer"
                >
                  SUBMIT PROJECT &gt;
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push("/submit");
                  setMobileOpen(false);
                }}
                className="text-left font-display text-3xl text-neutral-500 py-3 border-b border-[#222222] cursor-pointer"
              >
                SUBMISSION CLOSED 🔒
              </button>
            )}

            <button
              onClick={() => {
                if (!user && !hasActiveTeam) {
                  setAuthModalOpen(true);
                } else {
                  router.push("/team");
                }
                setMobileOpen(false);
              }}
              className="text-left font-display text-3xl text-amber-400 py-3 border-b border-[#222222] cursor-pointer"
            >
              DIGITAL PASS
            </button>

            {!user ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setAuthModalOpen(true);
                }}
                className="text-left font-display text-3xl text-orange-400 py-3 border-b border-[#222222] cursor-pointer"
              >
                SIGN IN
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="text-left font-display text-3xl text-rose-400 py-3 border-b border-[#222222] cursor-pointer"
              >
                SIGN OUT ({user.email})
              </button>
            )}
          </nav>
        </div>
      )}
    </>
  );
};