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

  // Pagination state
  const [paginatedTeams, setPaginatedTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);

  // Helper for admin headers
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

  // Fetch paginated teams (for admin)
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

  // Main data fetch
  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, annRes, statsRes] = await Promise.all([
        safeFetchJson("/api/teams"),
        safeFetchJson("/api/announcements"),
        safeFetchJson("/api/stats"),
      ]);

      if (teamsRes && teamsRes.success && Array.isArray(teamsRes.teams)) {
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

      if (annRes && annRes.success && Array.isArray(annRes.announcements)) {
        setAnnouncements(annRes.announcements);
      }

      if (statsRes && statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (_err) {
      // fallback
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

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Clear active team (called on sign‑out)
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