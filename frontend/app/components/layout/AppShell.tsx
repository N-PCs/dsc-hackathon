"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LiveAnnouncementsBanner } from "./LiveAnnouncementsBanner";
import { BackgroundVeins } from "./BackgroundVeins";
import { LoadingScreen } from "./LoadingScreen";
import { useTeams } from "@/context/TeamsContext"; // ← import from context

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const { teams, announcements, activeTeam, refreshData } = useTeams(); // ← use context

  const hasAnnouncement = announcements.length > 0 && !bannerDismissed;

  // Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  useEffect(() => {
    const pending = sessionStorage.getItem("pendingScroll");
    if (pending && pathname === "/") {
      sessionStorage.removeItem("pendingScroll");
      setTimeout(() => {
        const el = document.getElementById(pending);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [pathname]);

  return (
    <>
      <LoadingScreen />
      <BackgroundVeins />
      <LiveAnnouncementsBanner
        announcements={announcements}
        onDismiss={() => setBannerDismissed(true)}
      />
      <Navbar
        activeTab={pathname === "/" ? "home" : pathname.slice(1)}
        hasActiveTeam={!!activeTeam}
        hasAnnouncement={hasAnnouncement}
        registeredTeamCount={teams.length}
        onOpenLogin={() => {}}
        // activeTeamName removed – Navbar will read from context itself
      />
      <main className={`flex-1 ${hasAnnouncement ? "pt-10" : ""}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}