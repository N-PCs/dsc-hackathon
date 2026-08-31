"use client";

import { useState, useEffect, useCallback } from "react";
import { Team, Announcement, HackathonStats, TrackType } from "@/types";
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from "@/data/mockData";

const safeFetchJson = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
};

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeTeam, setActiveTeam] = useState<Team | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("origin_active_team_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return null;
  });
  const [stats, setStats] = useState<HackathonStats>({
    totalTeams: 0,
    verifiedTeams: 0,
    pendingTeams: 0,
    totalParticipants: 0,
    submittedProjects: 0,
    checkedInTeams: 0,
    trackCounts: {
      "AI & Machine Learning": 0,
      "Web3 & Blockchain": 0,
      "FinTech & Cybersecurity": 0,
      "HealthTech & BioInformatics": 0,
      "Smart City & IoT": 0,
      "Open Innovation & Social Impact": 0,
    },
  });

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, annRes, statsRes] = await Promise.all([
        safeFetchJson("/api/teams"),
        safeFetchJson("/api/announcements"),
        safeFetchJson("/api/stats"),
      ]);

      if (teamsRes && teamsRes.success && Array.isArray(teamsRes.teams)) {
        setTeams(teamsRes.teams);
        // Sync active team from localStorage
        const savedId = localStorage.getItem("origin_active_team_id");
        if (savedId) {
          const found = teamsRes.teams.find((t: Team) => t.id.toUpperCase() === savedId.toUpperCase());
          if (found) {
            setActiveTeam(found);
            localStorage.setItem("origin_active_team_data", JSON.stringify(found));
          }
        }
      }

      if (annRes && annRes.success && Array.isArray(annRes.announcements)) {
        setAnnouncements(annRes.announcements);
      }

      if (statsRes && statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (_err) {
      // Graceful fallback to initial state / cache
    }
  }, []);

  // Initial fetch + polling every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Persist active team changes
  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem("origin_active_team_id", activeTeam.id);
      localStorage.setItem("origin_active_team_data", JSON.stringify(activeTeam));
    } else {
      localStorage.removeItem("origin_active_team_id");
      localStorage.removeItem("origin_active_team_data");
    }
  }, [activeTeam]);

  return {
    teams,
    announcements,
    stats,
    activeTeam,
    setActiveTeam,
    refreshData,
  };
}