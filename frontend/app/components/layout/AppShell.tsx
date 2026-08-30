"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LiveAnnouncementsBanner } from "./LiveAnnouncementsBanner";
import { BackgroundVeins } from "./BackgroundVeins";
import { LoadingScreen } from "./LoadingScreen";
import { useTeams } from "@/hooks/useTeams";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const activeTab = pathname === "/" ? "home" : pathname.slice(1);

  const { teams, announcements, stats, activeTeam, setActiveTeam, refreshData } =
    useTeams();

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

  // ✅ NEW: Handle pending scroll after navigation
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingScroll");
    if (pending && pathname === "/") {
      sessionStorage.removeItem("pendingScroll");
      // Wait a tiny bit for the DOM to settle
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
        activeTab={activeTab}
        hasActiveTeam={!!activeTeam}
        hasAnnouncement={hasAnnouncement}
        registeredTeamCount={teams.length}
        onOpenLogin={() => {}}
      />
      <main className={`flex-1 ${hasAnnouncement ? "pt-10" : ""}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}