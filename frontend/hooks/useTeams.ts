"use client";

import { useState, useEffect, useCallback } from "react";
import { Team, Announcement, HackathonStats, TrackType } from "@/types";
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from "@/data/mockData";
import { useAuth } from "@/lib/authContext";

const safeFetchJson = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
};

export function useTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);

  // ✅ FIX: initialise to null, not from localStorage (hydration fix)
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

  // --- Pagination state ---
  const [paginatedTeams, setPaginatedTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    evaluatedCount: 0,
    pendingCount: 0,
  });
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);

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
    async (options: {
      page: number;
      limit: number;
      search: string;
      status: string;
      track: string;
      hasProject?: boolean;
      scored?: 'all' | 'true' | 'false';
    }) => {
      setIsLoadingPaginated(true);
      try {
        const { page, limit, search, status, track, hasProject, scored } = options;
        const query = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          search,
          status,
          track,
          ...(hasProject !== undefined && { hasProject: String(hasProject) }),
          ...(scored && scored !== 'all' && { scored }),
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
            evaluatedCount: data.pagination.evaluatedCount || 0,
            pendingCount: data.pagination.pendingCount || 0,
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Clear active team
  const clearActiveTeam = useCallback(() => {
    setActiveTeam(null);
    localStorage.removeItem("origin_active_team_id");
    localStorage.removeItem("origin_active_team_data");
  }, []);

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
    clearActiveTeam,
    refreshData,
    paginatedTeams,
    pagination,
    isLoadingPaginated,
    fetchPaginated,
  };
}