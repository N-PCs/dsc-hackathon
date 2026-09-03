"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Award,
  Search,
  CheckCircle,
  Clock,
  Eye,
  GitBranch,
  Globe,
  Radio,
  Layers,
  KeyRound,
  LogOut,
  ChevronRight,
  RefreshCw,
  FileText,
  Video,
  ExternalLink,
  File,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { Team } from "@/types";
import { useAuth } from "@/lib/authContext";

interface JuryPortalProps {
  paginatedTeams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    evaluatedCount: number;
    pendingCount: number;
  };
  isLoading: boolean;
  onFetchData: (filters: {
    page: number;
    limit: number;
    search: string;
    track: string;
    status: "all" | "evaluated" | "pending";
  }) => void;
  onRefreshData: () => void;
  onScoreProject: (
    teamId: string,
    score: {
      innovation: number;
      technicalComplexity: number;
      uiUx: number;
      presentation: number;
      impact: number;
      feedback: string;
    }
  ) => void;
}

// Storage key for filter persistence
const FILTER_STORAGE_KEY = "origin_jury_filters";

export const JuryPortal: React.FC<JuryPortalProps> = ({
  paginatedTeams,
  pagination,
  isLoading,
  onFetchData,
  onRefreshData,
  onScoreProject,
}) => {
  // Get Firebase user
  const { user, loading: authLoading } = useAuth();

  // Jury Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [juryEmail, setJuryEmail] = useState("");
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Allowed emails from backend
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  // Search & Filter State – initialised from sessionStorage
  const loadFilterState = () => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          search: parsed.search || "",
          status: parsed.status || "all",
          page: parsed.page || 1,
          limit: parsed.limit || 10,
        };
      }
    } catch (_) {}
    return null;
  };

  const savedFilters = loadFilterState();

  const [searchTerm, setSearchTerm] = useState(savedFilters?.search || "");
  const [statusFilter, setStatusFilter] = useState<"all" | "evaluated" | "pending">(
    savedFilters?.status || "all"
  );
  const [currentPage, setCurrentPage] = useState(savedFilters?.page || 1);
  const [pageSize, setPageSize] = useState(savedFilters?.limit || 10);

  // Selected Team for Details Modal & Scoring Modal
  const [selectedDetailTeam, setSelectedDetailTeam] = useState<Team | null>(null);
  const [selectedScoringTeam, setSelectedScoringTeam] = useState<Team | null>(null);

  // Scoring Form State
  const [scores, setScores] = useState({
    innovation: 15,
    technicalComplexity: 15,
    uiUx: 15,
    presentation: 15,
    impact: 15,
    feedback: "",
  });

  const JURY_PASSCODE = "JURY2026";

  // Clamp helper for score inputs
  const clampScore = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return 0;
    return Math.min(20, Math.max(0, num));
  };

  // Skip initial fetch on first render (parent already fetches)
  const isFirstRender = useRef(true);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch allowed emails on mount
  useEffect(() => {
    const fetchAllowedEmails = async () => {
      try {
        const res = await fetch("/api/jury/allowed-emails");
        const data = await res.json();
        if (data.success) {
          setAllowedEmails(data.allowedEmails.map((e: string) => e.toLowerCase()));
        }
      } catch (_) {
        // fallback: allow empty list (no access)
      }
    };
    fetchAllowedEmails();
  }, []);

  // ✅ FIX: Read localStorage and check consistency with Firebase user
  useEffect(() => {
    const auth = localStorage.getItem("origin_jury_auth") === "true";
    const storedEmail = localStorage.getItem("origin_jury_email") || "";

    // If Firebase user is logged in, ensure stored email matches
    if (user && user.email) {
      const firebaseEmail = user.email.toLowerCase();
      if (auth && storedEmail.toLowerCase() !== firebaseEmail) {
        // Mismatch: clear the stale jury session
        localStorage.removeItem("origin_jury_auth");
        localStorage.removeItem("origin_jury_email");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(auth);
      }
    } else {
      // No Firebase user: respect stored auth (but it will be invalid anyway)
      setIsAuthenticated(auth);
    }

    setIsAuthLoading(false);
  }, [user]);

  // Persist filter state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify({
          search: searchTerm,
          status: statusFilter,
          page: currentPage,
          limit: pageSize,
        })
      );
    } catch (_) {}
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  // Fetch data – with debounce only for search changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      onFetchData({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        track: "all",
        status: statusFilter,
      });
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [currentPage, pageSize, searchTerm, statusFilter, onFetchData]);

  // Handle login with double security
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const trimmedCode = accessCodeInput.trim().toUpperCase();
    const trimmedEmail = juryEmail.trim();

    if (!trimmedEmail) {
      setAuthError("Please enter your jury email address.");
      return;
    }

    if (trimmedCode !== JURY_PASSCODE) {
      setAuthError("Invalid Jury Access Code. Please check with the lead organiser.");
      return;
    }

    // 1️⃣ Check if email is in the allowed list
    if (!allowedEmails.includes(trimmedEmail.toLowerCase())) {
      setAuthError(
        `Your email "${trimmedEmail}" is not authorised for jury access. ` +
        `Please contact the organisers to add you to the allowed list.`
      );
      return;
    }

    // 2️⃣ Double security: if Firebase user is logged in, ensure it matches
    if (user && user.email) {
      const firebaseEmail = user.email.toLowerCase();
      if (firebaseEmail !== trimmedEmail.toLowerCase()) {
        setAuthError(
          `You are signed in with "${user.email}", which does not match the jury email you entered ("${trimmedEmail}").\n` +
          `Please sign out and sign in with the correct email, or enter the same email you are signed in with.`
        );
        return;
      }
    }

    // Success – both checks passed
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("origin_jury_auth", "true");
      localStorage.setItem("origin_jury_email", trimmedEmail.toLowerCase());
    }
    setAuthError("");
  };

  // ✅ FIX: Clear localStorage and reset state on logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("origin_jury_auth");
      localStorage.removeItem("origin_jury_email");
    }
    // Optionally reset form fields
    setJuryEmail("");
    setAccessCodeInput("");
    setAuthError("");
  };

  // Sync scores when opening scoring modal
  useEffect(() => {
    if (selectedScoringTeam?.project?.score) {
      const s = selectedScoringTeam.project.score;
      setScores({
        innovation: s.innovation ?? 15,
        technicalComplexity: s.technicalComplexity ?? 15,
        uiUx: s.uiUx ?? 15,
        presentation: s.presentation ?? 15,
        impact: s.impact ?? 15,
        feedback: s.feedback ?? "",
      });
    } else {
      setScores({
        innovation: 15,
        technicalComplexity: 15,
        uiUx: 15,
        presentation: 15,
        impact: 15,
        feedback: "",
      });
    }
  }, [selectedScoringTeam]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoringTeam) return;

    // Validate all scores are within 0-20
    const { innovation, technicalComplexity, uiUx, presentation, impact } = scores;
    const allValid = [innovation, technicalComplexity, uiUx, presentation, impact].every(
      (v) => v >= 0 && v <= 20
    );
    if (!allValid) {
      alert("All scores must be between 0 and 20.");
      return;
    }

    onScoreProject(selectedScoringTeam.id, scores);
    setSelectedScoringTeam(null);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Show loading spinner while checking auth status or Firebase loading
  if (isAuthLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Render Access Code Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-28 sm:pt-32 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-black border border-neutral-800 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-black border border-neutral-800 flex items-center justify-center mx-auto text-orange-500">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              Jury Portal Access
            </h2>
            <p className="text-xs text-neutral-400">
              Enter your Jury Access Code and your email address. Only authorised jury emails are allowed.
              {user && (
                <span className="block mt-1 text-orange-400">
                  You are currently signed in as: <strong>{user.email}</strong>
                </span>
              )}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] text-neutral-500 font-mono mb-1.5 uppercase tracking-wider">
                Your Jury Email
              </label>
              <input
                type="email"
                required
                placeholder="jury@yourdomain.com"
                value={juryEmail}
                onChange={(e) => setJuryEmail(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-500 font-mono mb-1.5 uppercase tracking-wider">
                Jury Access Code
              </label>
              <input
                type="password"
                placeholder="Enter Access Code"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/80 text-xs font-mono text-rose-400 whitespace-pre-wrap">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors border border-orange-500 flex items-center justify-center gap-2 cursor-pointer"
            >
              Verify & Enter Jury Portal
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUTHENTICATED VIEW (unchanged from previous version)
  // ============================================================
  return (
    <div className="min-h-screen pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black border border-neutral-800 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black border border-neutral-800 flex items-center justify-center text-orange-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Jury Evaluation Portal
              </h1>
              <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-semibold uppercase tracking-wider">
                Official Jury Access
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Review project submission details, inspect code & demos, and record rubric scores.
            </p>
            <p className="text-xs text-orange-400 font-mono mt-0.5">
              Logged in as:{" "}
              <span className="font-bold text-white">
                {typeof window !== "undefined" && localStorage.getItem("origin_jury_email")}
              </span>
              {user && user.email && (
                <span className="text-neutral-400 ml-2">
                  ( {user.email})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            title="Refresh Submissions"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-black hover:bg-neutral-900 border border-neutral-800 text-rose-400 font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Portal
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
        <div className="bg-black p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
              Total Submissions
            </span>
            <span className="text-3xl font-extrabold font-mono text-white">{pagination.total}</span>
          </div>
          <div className="p-3 bg-black border border-neutral-800 text-orange-500">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-black p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
              Evaluated Projects
            </span>
            <span className="text-3xl font-extrabold font-mono text-orange-500">{pagination.evaluatedCount}</span>
          </div>
          <div className="p-3 bg-black border border-neutral-800 text-orange-500">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-black p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
              Pending Evaluation
            </span>
            <span className="text-3xl font-extrabold font-mono text-amber-500">{pagination.pendingCount}</span>
          </div>
          <div className="p-3 bg-black border border-neutral-800 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-black border border-neutral-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by project title, team name, or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-neutral-800 focus:border-orange-500 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-600 font-mono focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "evaluated", "pending"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors border ${
                  statusFilter === st
                    ? "bg-orange-600 text-white font-semibold border-orange-500"
                    : "bg-black text-neutral-500 border-neutral-800 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
          <span>Submitted Projects ({pagination.total})</span>
        </h2>

        {isLoading ? (
          <div className="bg-black border border-neutral-800 p-12 text-center text-neutral-500">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
            <p className="text-xs font-mono">Loading submissions...</p>
          </div>
        ) : paginatedTeams.length === 0 ? (
          <div className="bg-black border border-neutral-800 p-12 text-center text-neutral-500 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-xs font-mono">No project submissions match your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800 border border-neutral-800">
            {paginatedTeams.map((team) => {
              const proj = team.project;
              if (!proj) return null;
              const hasScore = !!proj.score && proj.score.total > 0;

              return (
                <div
                  key={team.id}
                  className="bg-black p-6 sm:p-8 space-y-5 hover:bg-neutral-950 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 border border-orange-500/30 uppercase tracking-wider">
                          {proj.track || team.track}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white mt-2 group-hover:text-orange-500 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                          {proj.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-1">{proj.tagline}</p>
                      </div>

                      {hasScore ? (
                        <div className="text-right">
                          <span className="text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 font-bold">
                            Score: {proj.score?.total}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono text-neutral-400 flex items-center gap-3 pt-1">
                      <span className="font-semibold text-white">Team: {team.teamName}</span>
                      <span>•</span>
                      <span>Leader: {team.leader.name}</span>
                    </div>

                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-black border border-neutral-800 text-neutral-400 px-2 py-0.5"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Attachment Links */}
                    {(proj.presentationPdfUrl || proj.presentationPptUrl) && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-neutral-800/50 pt-2">
                        {proj.presentationPdfUrl && (
                          <a
                            href={proj.presentationPdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1 transition-colors"
                          >
                            <FileText className="w-3 h-3" /> PDF
                          </a>
                        )}
                        {proj.presentationPptUrl && (
                          <a
                            href={proj.presentationPptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-mono text-purple-400 hover:underline flex items-center gap-1 transition-colors"
                          >
                            <File className="w-3 h-3" /> PPT/PPTX
                          </a>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-1 text-xs font-mono">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-orange-500 transition-colors"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          Code
                        </a>
                      )}
                      {proj.deploymentUrl && (
                        <a
                          href={proj.deploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-emerald-400 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      )}
                      {proj.videoUrl && (
                        <a
                          href={proj.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-purple-400 transition-colors"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          Video
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-900">
                    <button
                      onClick={() => setSelectedDetailTeam(team)}
                      className="flex-1 py-2.5 bg-black border border-neutral-800 hover:border-neutral-700 font-mono text-xs uppercase tracking-wider font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <button
                      onClick={() => setSelectedScoringTeam(team)}
                      className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-orange-500"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {hasScore ? "Edit Score" : "Evaluate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black border border-neutral-800 p-4">
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="bg-black border border-neutral-800 px-2 py-1 text-white focus:outline-none"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>
            {pagination.total === 0
              ? "0 items"
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, pagination.total)} of ${pagination.total}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum: number;
            if (pagination.totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;
            if (pageNum < 1 || pageNum > pagination.totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1.5 border ${currentPage === pageNum ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-transparent text-neutral-400 hover:text-white"}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetailTeam && selectedDetailTeam.project && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-neutral-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 border border-orange-500/30 uppercase tracking-wider">
                  {selectedDetailTeam.track}
                </span>
                <h3 className="text-xl font-bold text-white mt-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {selectedDetailTeam.project.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">
                  Submitted by Team <span className="text-white font-semibold">{selectedDetailTeam.teamName}</span> ({selectedDetailTeam.id})
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailTeam(null)}
                className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Tagline / Summary</h4>
              <p className="text-xs text-neutral-200 bg-black p-3 border border-neutral-800">
                {selectedDetailTeam.project.tagline}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Problem Statement</h4>
              <p className="text-xs text-neutral-300 leading-relaxed bg-black p-4 border border-neutral-800 whitespace-pre-wrap">
                {selectedDetailTeam.project.problemStatement}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">Solution Description</h4>
              <p className="text-xs text-neutral-300 leading-relaxed bg-black p-4 border border-neutral-800 whitespace-pre-wrap">
                {selectedDetailTeam.project.solutionDescription}
              </p>
            </div>

            {selectedDetailTeam.project.techStack && (
              <div>
                <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDetailTeam.project.techStack.map((tech, i) => (
                    <span key={i} className="text-xs font-mono bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3 py-1">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-2">Submission Artifact Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDetailTeam.project.githubUrl && (
                  <a
                    href={selectedDetailTeam.project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-orange-500 font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <GitBranch className="w-4 h-4" /> GitHub Repository
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.deploymentUrl && (
                  <a
                    href={selectedDetailTeam.project.deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-emerald-400 font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Globe className="w-4 h-4" /> Live Product Demo
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.presentationPdfUrl && (
                  <a
                    href={selectedDetailTeam.project.presentationPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-blue-400 font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <FileText className="w-4 h-4" /> PDF Document
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.presentationPptUrl && (
                  <a
                    href={selectedDetailTeam.project.presentationPptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-purple-400 font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <File className="w-4 h-4" /> PPT/PPTX Presentation
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.videoUrl && (
                  <a
                    href={selectedDetailTeam.project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-black hover:bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs text-rose-400 font-mono transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Video className="w-4 h-4" /> Video Demo
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const teamToScore = selectedDetailTeam;
                  setSelectedDetailTeam(null);
                  setSelectedScoringTeam(teamToScore);
                }}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors border border-orange-500"
              >
                Evaluate & Score Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Modal */}
      {selectedScoringTeam && selectedScoringTeam.project && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-neutral-800 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h4 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  Jury Rubric Scorecard
                </h4>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  {selectedScoringTeam.project.title} • {selectedScoringTeam.teamName}
                </p>
              </div>
              <button
                onClick={() => setSelectedScoringTeam(null)}
                className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Innovation (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.innovation}
                    onChange={(e) => setScores({ ...scores, innovation: clampScore(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Tech Depth (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.technicalComplexity}
                    onChange={(e) => setScores({ ...scores, technicalComplexity: clampScore(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    UI/UX (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.uiUx}
                    onChange={(e) => setScores({ ...scores, uiUx: clampScore(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                    Presentation (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.presentation}
                    onChange={(e) => setScores({ ...scores, presentation: clampScore(e.target.value) })}
                    className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Impact & Feasibility (/20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={scores.impact}
                  onChange={(e) => setScores({ ...scores, impact: clampScore(e.target.value) })}
                  className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white font-mono outline-none"
                />
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 p-3.5 flex items-center justify-between">
                <span className="font-semibold text-orange-400 uppercase tracking-wider text-[11px]">Calculated Rubric Score:</span>
                <span className="text-base font-bold font-mono text-white">
                  {scores.innovation + scores.technicalComplexity + scores.uiUx + scores.presentation + scores.impact} / 100
                </span>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Jury Feedback & Remarks
                </label>
                <textarea
                  rows={3}
                  value={scores.feedback}
                  onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                  placeholder="Provide constructive feedback for the team..."
                  className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-2.5 text-white placeholder:text-neutral-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScoringTeam(null)}
                  className="px-4 py-2 bg-black border border-neutral-800 text-neutral-300 font-mono text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold border border-orange-500 cursor-pointer"
                >
                  Save & Record Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};