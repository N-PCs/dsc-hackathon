"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { Team, Announcement, HackathonStats } from "@/types";
import { INITIAL_ANNOUNCEMENTS } from "@/data/mockData";
import { DEFAULT_SUBMISSION_DEADLINE } from "@/lib/deadline";
import { useAuth } from "@/lib/authContext";

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  evaluatedCount: number;
  pendingCount: number;
}

export type LiveStatusPatch = {
  submissionsOpen?: boolean;
  registrationsOpen?: boolean;
  announcements?: Announcement[];
  deadline?: string;
  isDeadlinePassed?: boolean;
};

interface TeamsContextType {
  teams: Team[];
  announcements: Announcement[];
  stats: HackathonStats;
  activeTeam: Team | null;
  setActiveTeam: (team: Team | null) => void;
  clearActiveTeam: () => void;
  refreshData: () => void;
  submissionsOpen: boolean;
  registrationsOpen: boolean;
  submissionDeadline: string;
  isDeadlinePassed: boolean;
  applyLiveStatus: (patch: LiveStatusPatch) => void;
  refreshLiveStatus: () => void;
  paginatedTeams: Team[];
  pagination: PaginationState;
  isLoadingPaginated: boolean;
  fetchPaginated: (options: {
    page: number;
    limit: number;
    search: string;
    status: string;
    track: string;
    hasProject?: boolean;
    scored?: "all" | "true" | "false";
  }) => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

const FETCH_TIMEOUT_MS = 15000;
const DATA_POLL_MS = 30000;
const LIVE_POLL_MS = 2000;
const LIVE_CHANNEL = "origin-live-status";

const emptyStats: HackathonStats = {
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
};

const safeFetchJson = async (url: string, options?: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const TeamsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [stats, setStats] = useState<HackathonStats>(emptyStats);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [registrationsOpen, setRegistrationsOpen] = useState(true);
  const [submissionDeadline, setSubmissionDeadline] = useState(DEFAULT_SUBMISSION_DEADLINE);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [paginatedTeams, setPaginatedTeams] = useState<Team[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    evaluatedCount: 0,
    pendingCount: 0,
  });
  const [isLoadingPaginated, setIsLoadingPaginated] = useState(false);
  const dataInFlightRef = useRef(false);
  const liveInFlightRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const applyLiveStatus = useCallback((patch: LiveStatusPatch, broadcast = true) => {
    if (typeof patch.submissionsOpen === "boolean") setSubmissionsOpen(patch.submissionsOpen);
    if (typeof patch.registrationsOpen === "boolean") setRegistrationsOpen(patch.registrationsOpen);
    if (typeof patch.isDeadlinePassed === "boolean") setIsDeadlinePassed(patch.isDeadlinePassed);
    if (typeof patch.deadline === "string" && patch.deadline) setSubmissionDeadline(patch.deadline);
    if (Array.isArray(patch.announcements)) setAnnouncements(patch.announcements);
    if (broadcast && channelRef.current) {
      channelRef.current.postMessage(patch);
    }
  }, []);

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
      scored?: "all" | "true" | "false";
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
          ...(scored && scored !== "all" && { scored }),
        }).toString();

        const data = await safeFetchJson(`/api/teams?${query}`, {
          headers: { ...getAdminHeaders() },
        });
        if (data?.success) {
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

  const resolveActiveTeam = useCallback(async (email?: string | null) => {
    const savedId = typeof window !== "undefined" ? localStorage.getItem("origin_active_team_id") : null;
    const identifier = email?.trim().toLowerCase() || savedId;
    if (!identifier) return;

    const data = await safeFetchJson("/api/teams/auth/team-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });

    if (data?.success && data.team) {
      setActiveTeam(data.team);
      setTeams((prev) => {
        const others = prev.filter((t) => t.id !== data.team.id);
        return [data.team, ...others];
      });
      localStorage.setItem("origin_active_team_id", data.team.id);
      localStorage.setItem("origin_active_team_data", JSON.stringify(data.team));
    }
  }, []);

  const fetchLiveStatus = useCallback(async () => {
    if (liveInFlightRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;
    liveInFlightRef.current = true;
    try {
      const data = await safeFetchJson("/api/live-status");
      if (data?.success) {
        applyLiveStatus(
          {
            submissionsOpen: data.submissionsOpen,
            registrationsOpen: data.registrationsOpen,
            announcements: data.announcements,
            deadline: data.deadline,
            isDeadlinePassed: data.isDeadlinePassed,
          },
          false
        );
      }
    } finally {
      liveInFlightRef.current = false;
    }
  }, [applyLiveStatus]);

  const fetchData = useCallback(async () => {
    if (dataInFlightRef.current) return;
    dataInFlightRef.current = true;
    try {
      const statsRes = await safeFetchJson("/api/stats");
      if (statsRes?.success && statsRes.stats) {
        setStats(statsRes.stats);
      }

      const savedId = localStorage.getItem("origin_active_team_id");
      if (savedId) {
        const teamRes = await safeFetchJson(`/api/teams/${encodeURIComponent(savedId)}`);
        if (teamRes?.success && teamRes.team) {
          setActiveTeam(teamRes.team);
          localStorage.setItem("origin_active_team_data", JSON.stringify(teamRes.team));
        }
      }
    } finally {
      dataInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(LIVE_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event: MessageEvent<LiveStatusPatch>) => {
      if (event.data) applyLiveStatus(event.data, false);
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [applyLiveStatus]);

  useEffect(() => {
    if (user?.email) {
      resolveActiveTeam(user.email);
    }
  }, [user?.email, resolveActiveTeam]);

  useEffect(() => {
    fetchLiveStatus();
    fetchData();
    const liveId = setInterval(fetchLiveStatus, LIVE_POLL_MS);
    const dataId = setInterval(fetchData, DATA_POLL_MS);
    const onVisible = () => {
      if (!document.hidden) fetchLiveStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(liveId);
      clearInterval(dataId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchLiveStatus, fetchData]);

  const refreshData = useCallback(() => {
    fetchLiveStatus();
    fetchData();
  }, [fetchLiveStatus, fetchData]);

  const clearActiveTeam = useCallback(() => {
    setActiveTeam(null);
    localStorage.removeItem("origin_active_team_id");
    localStorage.removeItem("origin_active_team_data");
  }, []);

  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem("origin_active_team_id", activeTeam.id);
      localStorage.setItem("origin_active_team_data", JSON.stringify(activeTeam));
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
    submissionsOpen,
    registrationsOpen,
    submissionDeadline,
    isDeadlinePassed,
    applyLiveStatus,
    refreshLiveStatus: fetchLiveStatus,
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
