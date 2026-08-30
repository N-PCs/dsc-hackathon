"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
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
  onOpenLogin,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Updated handleNavClick with smooth scrolling
  const handleNavClick = (tab: string, scrollTo?: string) => {
    setMobileOpen(false);

    if (tab === "home") {
      if (pathname === "/") {
        // Already on home – scroll directly
        if (scrollTo) {
          const el = document.getElementById(scrollTo);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        // Navigate to home and store the target for later
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

            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="font-heading text-[14px] tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase">
                  Sign In
                </button>
              </SignInButton>
            )}

            {isLoaded && isSignedIn && (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-[#FF3B00]",
                  },
                }}
              />
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
          </nav>
        </div>
      )}
    </>
  );
};