"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, User as UserIcon, Shield, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { EXTERNAL_REGISTRATION_URL } from "@/data/mockData";

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
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (tab: string, scrollTo?: string) => {
    setMobileOpen(false);

    if (tab === "home") {
      if (pathname === "/") {
        if (scrollTo) {
          const el = document.getElementById(scrollTo);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        router.push("/");
        if (scrollTo) {
          sessionStorage.setItem("pendingScroll", scrollTo);
        }
      }
    } else {
      router.push(`/${tab}`);
    }
  };

  const navLinks = [
    { id: "home", label: "MAIN", scrollTo: "hero" },
    { id: "home", label: "SPONSORS", scrollTo: "sponsors" },
    { id: "home", label: "SCHEDULE", scrollTo: "timeline-section" },
    { id: "home", label: "FAQ", scrollTo: "faq-section" },
  ];

  const isActive = (linkLabel: string) => {
    if (pathname === "/") {
      return activeTab === "home" && linkLabel === "MAIN";
    }
    return activeTab === linkLabel.toLowerCase();
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
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

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link.id, link.scrollTo)}
                className={`font-heading text-[15px] tracking-widest uppercase transition-all duration-200 cursor-pointer relative py-1 ${
                  isActive(link.label)
                    ? "text-[#FF3B00] font-bold border-b-2 border-[#FF3B00] drop-shadow-[0_2px_8px_rgba(255,59,0,0.4)]"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {hasActiveTeam && (
              <button
                onClick={() => router.push("/team")}
                className={`hidden sm:inline-flex font-heading text-[14px] tracking-wider transition-colors cursor-pointer uppercase ${
                  pathname === "/team" ? "text-[#FF3B00] font-bold" : "text-neutral-300 hover:text-[#FF3B00]"
                }`}
              >
                My Pass
              </button>
            )}

            <button
              onClick={() => window.open(EXTERNAL_REGISTRATION_URL, "_blank")}
              className="hidden md:inline-flex filter-pill cursor-pointer"
            >
              REGISTER &gt;
            </button>

            {!loading && !user && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="font-heading text-[14px] tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase px-3 py-1.5 border border-neutral-800 hover:border-[#FF3B00] bg-[#111111]"
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

                {/* Dropdown Menu */}
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
                    </div>

                    <div className="border-t border-[#222222] pt-2">
                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                        }}
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

      {mobileOpen && (
        <div
          style={{ paddingTop: hasAnnouncement ? "8rem" : "6rem" }}
          className="fixed inset-0 z-40 bg-[#0A0A0A] px-6 md:hidden overflow-y-auto"
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleNavClick(link.id, link.scrollTo)}
                className={`text-left font-display text-3xl py-3 border-b border-[#222222] cursor-pointer transition-all ${
                  isActive(link.label)
                    ? "text-[#FF3B00] font-bold border-l-4 border-l-[#FF3B00] pl-3"
                    : "text-white hover:text-[#FF3B00]"
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                window.open(EXTERNAL_REGISTRATION_URL, "_blank");
                setMobileOpen(false);
              }}
              className="text-left font-display text-3xl text-[#FF3B00] py-3 border-b border-[#222222] cursor-pointer"
            >
              REGISTER NOW &gt;
            </button>
            {hasActiveTeam && (
              <button
                onClick={() => {
                  router.push("/team");
                  setMobileOpen(false);
                }}
                className="text-left font-display text-3xl text-neutral-400 py-3 border-b border-[#222222] cursor-pointer"
              >
                MY DIGITAL PASS
              </button>
            )}
            <button
              onClick={() => {
                router.push("/submit");
                setMobileOpen(false);
              }}
              className="text-left font-display text-3xl text-neutral-400 py-3 border-b border-[#222222] cursor-pointer"
            >
              SUBMIT PROJECT
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
                onClick={async () => {
                  setMobileOpen(false);
                  await signOut();
                }}
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