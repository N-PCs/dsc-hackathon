"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Team, Announcement, HackathonStats, TrackType } from "@/types";
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from "@/data/mockData";
import { useAuth } from "@/lib/authContext";

interface TeamsContextType {
  teams: Team[];
  announcements: Announcement[];
  stats: HackathonStats;
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  clearActiveTeam: () => void;
  refreshData: () => void;
  paginatedTeams: Team[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  isLoadingPaginated: boolean;
  fetchPaginated: (options: any) => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

const safeFetchJson = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
};

export const TeamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // State
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
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

  // Pagination state
  const [paginatedTeams, setPaginatedTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);

  // Polling backoff state
  const [fetchFailureCount, setFetchFailureCount] = useState(0);
  const MAX_FAILURES = 5; // stop polling after 5 consecutive failures
  const BASE_INTERVAL = 5000; // 5 seconds
  const MAX_BACKOFF = 60000; // 1 minute max

  const getAdminHeaders = (): Record<string, string> => {
    try {
      const saved = localStorage.getItem("origin_active_admin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          return { "x-admin-email": String(parsed.email) };
        }
      }
    } catch (_e) {}
    return {};
  };

  const fetchPaginated = useCallback(
    async (options: { page: number; limit: number; search: string; status: string; track: string }) => {
      setIsLoadingPaginated(true);
      try {
        const { page, limit, search, status, track } = options;
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search,
          status,
          track,
        }).toString();

        const res = await fetch(`/api/teams?${query}`, {
          headers: { ...getAdminHeaders() },
        });
        const data = await res.json();
        if (data.success) {
          setPaginatedTeams(data.teams);
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          });
        }
      } catch (err) {
        console.error("Failed to fetch paginated teams:", err);
      } finally {
        setIsLoadingPaginated(false);
      }
    },
    []
  );

  // Main data fetch with backoff
  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, annRes, statsRes] = await Promise.all([
        safeFetchJson("/api/teams"),
        safeFetchJson("/api/announcements"),
        safeFetchJson("/api/stats"),
      ]);

      // If any of the calls failed (returned null), treat as failure
      if (!teamsRes || !annRes || !statsRes) {
        throw new Error("One or more API calls failed");
      }

      // Success: reset failure count and update state
      setFetchFailureCount(0);

      if (teamsRes.success && Array.isArray(teamsRes.teams)) {
        setTeams(teamsRes.teams);
        const savedId = localStorage.getItem("origin_active_team_id");
        if (savedId) {
          const found = teamsRes.teams.find(
            (t: Team) => t.id.toUpperCase() === savedId.toUpperCase()
          );
          if (found) {
            setActiveTeam(found);
            localStorage.setItem("origin_active_team_data", JSON.stringify(found));
          }
        }
      }

      if (annRes.success && Array.isArray(annRes.announcements)) {
        setAnnouncements(annRes.announcements);
      }

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (_err) {
      // Increment failure count
      setFetchFailureCount((prev) => prev + 1);
    }
  }, []);

  // Auto‑match team when Firebase user logs in
  useEffect(() => {
    if (user?.email) {
      const cleanEmail = user.email.toLowerCase().trim();
      const matched = teams.find(
        (t) =>
          t.leader.email.toLowerCase() === cleanEmail ||
          t.member2?.email?.toLowerCase() === cleanEmail ||
          t.member3?.email?.toLowerCase() === cleanEmail ||
          t.member4?.email?.toLowerCase() === cleanEmail ||
          t.member5?.email?.toLowerCase() === cleanEmail
      );
      if (matched) {
        setActiveTeam(matched);
        localStorage.setItem("origin_active_team_id", matched.id);
        localStorage.setItem("origin_active_team_data", JSON.stringify(matched));
      }
    }
  }, [user, teams]);

  // Initial fetch + polling with backoff
  useEffect(() => {
    // Immediately fetch once
    fetchData();

    // Determine dynamic interval based on failure count
    const getInterval = () => {
      if (fetchFailureCount === 0) return BASE_INTERVAL;
      // Exponential backoff: 5s, 10s, 20s, 40s, 60s
      const backoff = Math.min(BASE_INTERVAL * Math.pow(2, fetchFailureCount - 1), MAX_BACKOFF);
      return backoff;
    };

    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      const delay = getInterval();
      intervalId = setInterval(() => {
        // Only fetch if we haven't reached max failures
        if (fetchFailureCount < MAX_FAILURES) {
          fetchData();
        } else {
          // Stop polling after max failures; optionally log a warning
          console.warn("Polling stopped due to too many consecutive API failures.");
          if (intervalId) clearInterval(intervalId);
        }
      }, delay);
    };

    startPolling();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, fetchFailureCount]);

  const refreshData = useCallback(() => {
    setFetchFailureCount(0); // reset failure count on manual refresh
    fetchData();
  }, [fetchData]);

  const clearActiveTeam = useCallback(() => {
    setActiveTeam(null);
    localStorage.removeItem("origin_active_team_id");
    localStorage.removeItem("origin_active_team_data");
  }, []);

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

  const value: TeamsContextType = {
    teams,
    announcements,
    stats,
    activeTeam,
    setActiveTeam,
    clearActiveTeam,
    refreshData,
    paginatedTeams,
    pagination,
    isLoadingPaginated,
    fetchPaginated,
  };

  return <TeamsContext.Provider value={value}>{children}</TeamsContext.Provider>;
};

export const useTeams = (): TeamsContextType => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error("useTeams must be used within a TeamsProvider");
  }
  return context;
};