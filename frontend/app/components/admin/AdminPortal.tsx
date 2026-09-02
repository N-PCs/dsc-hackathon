"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Shield,
  ShieldCheck,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Award,
  Trash2,
  Lock,
  Radio,
  FileSpreadsheet,
  Layers,
  GitBranch,
  Globe,
  FileText,
  Clock,
  Mail,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Plus,
  UserPlus,
  LogOut,
  ChevronRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  File,
} from "lucide-react";
import { Team, Announcement, TrackType, PaymentStatus, AdminUser } from "@/types";
import { HACKATHON_TRACKS } from "@/data/mockData";

const DEFAULT_AUTHORIZED_ADMINS: AdminUser[] = [
  { email: "neelpandeyofficial@gmail.com", name: "Neel Pandey", role: "Superadmin", department: "Data Science Club Lead", addedAt: "2026-08-20" },
  { email: "varun.25bce10360@vitbhopal.ac.in", name: "Neel Pandey", role: "Superadmin", department: "Data Science Club Lead", addedAt: "2026-08-20" },
  { email: "dsc.vitbhopal@gmail.com", name: "DSC Executive Council", role: "Lead Organizer", department: "Core Operations", addedAt: "2026-08-15" },
  { email: "admin@vitbhopal.ac.in", name: "VIT Operations Head", role: "Superadmin", department: "Academic & Event Affairs", addedAt: "2026-08-10" },
  { email: "lead.origin@vitbhopal.ac.in", name: "Origin Convener", role: "Lead Organizer", department: "Hackathon Operations", addedAt: "2026-08-12" },
  { email: "faculty.advisor@vitbhopal.ac.in", name: "Dr. Faculty Coordinator", role: "Faculty Advisor", department: "School of Computing Science", addedAt: "2026-08-10" },
  { email: "jury.chair@origin.org", name: "Chief Evaluation Jury", role: "Jury Chair", department: "Industry Rubric Panel", addedAt: "2026-08-14" },
];

interface AdminPortalProps {
  paginatedTeams: Team[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  isLoading: boolean;
  announcements: Announcement[];
  search: string;
  setSearch: (val: string) => void;
  statusFilter: "all" | "pending" | "verified" | "rejected";
  setStatusFilter: (val: "all" | "pending" | "verified" | "rejected") => void;
  trackFilter: string;
  setTrackFilter: (val: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  onUpdateTeamStatus: (teamId: string, status: { paymentStatus?: PaymentStatus; checkedInVenue?: boolean; ticketIssued?: boolean; notes?: string }) => void;
  onScoreProject: (teamId: string, score: { innovation: number; technicalComplexity: number; uiUx: number; presentation: number; impact: number; feedback: string }) => void;
  onDeleteTeam: (teamId: string) => void;
  onSendAnnouncement: (title: string, message: string, category: "urgent" | "schedule" | "food" | "mentorship" | "general") => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onRefreshData: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  paginatedTeams,
  pagination,
  isLoading,
  announcements,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  trackFilter,
  setTrackFilter,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  onUpdateTeamStatus,
  onScoreProject,
  onDeleteTeam,
  onSendAnnouncement,
  onDeleteAnnouncement,
  onRefreshData,
}) => {
  const router = useRouter();
  const { user: firebaseUser, signOut: firebaseSignOut, signInWithGoogle, signInWithEmail, loading: isAuthLoading } = useAuth();

  // ----- Admin auth state -----
  const [adminWhitelist, setAdminWhitelist] = useState<AdminUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("origin_admin_whitelist");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_e) {
          localStorage.removeItem("origin_admin_whitelist");
          return DEFAULT_AUTHORIZED_ADMINS;
        }
      }
    }
    return DEFAULT_AUTHORIZED_ADMINS;
  });

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("origin_active_admin");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_e) {
          localStorage.removeItem("origin_active_admin");
          return null;
        }
      }
    }
    return null;
  });

  const [emailInput, setEmailInput] = useState("");
  const [authStep, setAuthStep] = useState<"email" | "otp">("email");
  const [otpInput, setOtpInput] = useState("");
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [authError, setAuthError] = useState("");
  const [authSuccessNotice, setAuthSuccessNotice] = useState("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"Superadmin" | "Lead Organizer" | "Jury Chair" | "Operations Lead" | "Faculty Advisor">("Lead Organizer");
  const [newAdminDept, setNewAdminDept] = useState("Hackathon Operations");
  const [addAdminSuccess, setAddAdminSuccess] = useState("");

  const [adminTab, setAdminTab] = useState<"teams" | "submissions" | "leaderboard" | "broadcast" | "access">("teams");

  const [selectedProofTeam, setSelectedProofTeam] = useState<Team | null>(null);
  const [selectedScoringTeam, setSelectedScoringTeam] = useState<Team | null>(null);

  const [scores, setScores] = useState({
    innovation: 18,
    technicalComplexity: 18,
    uiUx: 17,
    presentation: 18,
    impact: 19,
    feedback: "",
  });

  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annCategory, setAnnCategory] = useState<"urgent" | "schedule" | "food" | "mentorship" | "general">("general");
  const [annSuccess, setAnnSuccess] = useState(false);

  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(true);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [isTogglingSubmissions, setIsTogglingSubmissions] = useState(false);
  const [isTogglingRegistrations, setIsTogglingRegistrations] = useState(false);
  const [isClearingDb, setIsClearingDb] = useState(false);

  // --- Fetch statuses ---
  useEffect(() => {
    fetch("/api/admin/submissions-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsSubmissionsOpen(data.submissionsOpen);
          if (data.deadline) setSubmissionDeadline(data.deadline);
          if (typeof data.isDeadlinePassed === "boolean") setIsDeadlinePassed(data.isDeadlinePassed);
        }
      })
      .catch(() => {});

    fetch("/api/admin/registrations-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.registrationsOpen === "boolean") {
          setIsRegistrationsOpen(data.registrationsOpen);
        }
      })
      .catch(() => {});

    fetch("/api/admin/whitelist")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.authorizedAdmins)) {
          setAdminWhitelist(data.authorizedAdmins);
          if (typeof window !== "undefined") {
            localStorage.setItem("origin_admin_whitelist", JSON.stringify(data.authorizedAdmins));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (firebaseUser?.email) {
      const email = firebaseUser.email.toLowerCase();
      const matchedAdmin = adminWhitelist.find((a) => a.email.toLowerCase() === email);
      if (matchedAdmin) {
        setCurrentAdmin(matchedAdmin);
        if (typeof window !== "undefined") {
          localStorage.setItem("origin_active_admin", JSON.stringify(matchedAdmin));
        }
      } else {
        setCurrentAdmin(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("origin_active_admin");
        }
      }
    } else {
      setCurrentAdmin(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("origin_active_admin");
      }
    }
  }, [firebaseUser, adminWhitelist]);

  // --- Admin action handlers ---
  const handleToggleSubmissions = async () => {
    if (!currentAdmin) return;
    const nextState = !isSubmissionsOpen;
    setIsTogglingSubmissions(true);
    try {
      const res = await fetch("/api/admin/submissions-toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": currentAdmin.email,
        },
        body: JSON.stringify({ submissionsOpen: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmissionsOpen(data.submissionsOpen);
      }
    } catch (err) {
      alert("Failed to toggle submission status.");
    } finally {
      setIsTogglingSubmissions(false);
    }
  };

  const handleToggleRegistrations = async () => {
    if (!currentAdmin) return;
    const nextState = !isRegistrationsOpen;
    setIsTogglingRegistrations(true);
    try {
      const res = await fetch("/api/admin/registrations-toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": currentAdmin.email,
        },
        body: JSON.stringify({ registrationsOpen: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsRegistrationsOpen(data.registrationsOpen);
      } else {
        alert(data.message || "Failed to toggle registration status.");
      }
    } catch (err) {
      alert("Failed to toggle registration status.");
    } finally {
      setIsTogglingRegistrations(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!currentAdmin) return;
    if (!window.confirm("⚠️ WARNING: Are you sure you want to WIPE all team registrations, submissions, and announcements from the database? This action is permanent.")) {
      return;
    }
    setIsClearingDb(true);
    try {
      const res = await fetch("/api/admin/clear-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": currentAdmin.email,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Database cleared successfully!");
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.message || "Failed to clear database.");
      }
    } catch (err) {
      alert("Failed to clear database.");
    } finally {
      setIsClearingDb(false);
    }
  };

  const handleQuickVerifiedSignIn = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    if (typeof window !== "undefined") {
      localStorage.setItem("origin_active_admin", JSON.stringify(admin));
    }
    setAuthError("");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanOtp = otpInput.trim();

    setAuthError("");

    if (!cleanOtp) {
      setAuthError("Please enter the 6-digit verification passcode.");
      return;
    }

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentAdmin(data.admin);
        if (typeof window !== "undefined") {
          localStorage.setItem("origin_active_admin", JSON.stringify(data.admin));
        }
      } else if (cleanOtp === sentOtp) {
        const localAdmin = adminWhitelist.find((a) => a.email.toLowerCase() === cleanEmail);
        if (localAdmin) {
          setCurrentAdmin(localAdmin);
          localStorage.setItem("origin_active_admin", JSON.stringify(localAdmin));
        } else {
          setAuthError("Unauthorized admin email.");
        }
      } else {
        setAuthError(data.message || "Invalid or expired verification passcode.");
      }
    } catch (err) {
      if (cleanOtp === sentOtp) {
        const localAdmin = adminWhitelist.find((a) => a.email.toLowerCase() === cleanEmail);
        if (localAdmin) {
          setCurrentAdmin(localAdmin);
          localStorage.setItem("origin_active_admin", JSON.stringify(localAdmin));
        }
      } else {
        setAuthError("Invalid verification passcode.");
      }
    }
  };

  const handleSignOut = async () => {
    setCurrentAdmin(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("origin_active_admin");
    }
    setAuthStep("email");
    setOtpInput("");
    setSentOtp(null);
    setAuthError("");
    setAuthSuccessNotice("");
    try {
      await firebaseSignOut();
    } catch (_e) {}
  };

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim() || !currentAdmin) return;

    const emailToAdd = newAdminEmail.trim().toLowerCase();
    const existing = adminWhitelist.find((a) => a.email.toLowerCase() === emailToAdd);
    if (existing) {
      alert("This email is already in the authorized admin directory.");
      return;
    }

    const newAdminObj: AdminUser = {
      email: emailToAdd,
      name: newAdminName.trim(),
      role: newAdminRole,
      department: newAdminDept.trim() || "Hackathon Operations",
      addedAt: new Date().toISOString().split("T")[0],
    };

    try {
      await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": currentAdmin.email,
        },
        body: JSON.stringify(newAdminObj),
      });
    } catch (_e) {}

    const updated = [...adminWhitelist, newAdminObj];
    setAdminWhitelist(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("origin_admin_whitelist", JSON.stringify(updated));
    }

    setNewAdminEmail("");
    setNewAdminName("");
    setAddAdminSuccess(`Added ${newAdminObj.name} (${newAdminObj.email}) to authorized admin whitelist.`);
    setTimeout(() => setAddAdminSuccess(""), 4000);
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    if (adminWhitelist.length <= 1) {
      alert("Cannot remove the only remaining superadministrator.");
      return;
    }
    if (currentAdmin?.email.toLowerCase() === emailToRemove.toLowerCase()) {
      alert("You cannot revoke access for your own currently active session.");
      return;
    }
    if (!confirm(`Revoke admin privileges for ${emailToRemove}?`)) return;

    try {
      await fetch(`/api/admin/whitelist/${encodeURIComponent(emailToRemove)}`, {
        method: "DELETE",
        headers: {
          "x-admin-email": currentAdmin?.email || "",
        },
      });
    } catch (_e) {}

    const updated = adminWhitelist.filter((a) => a.email.toLowerCase() !== emailToRemove.toLowerCase());
    setAdminWhitelist(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("origin_admin_whitelist", JSON.stringify(updated));
    }
  };

  const handleExportExcel = () => {
    window.open("/api/export-excel", "_blank");
  };

  const handleExportCsv = () => {
    window.open("/api/export-csv", "_blank");
  };

  const calcTeamFee = (t: Team) => {
    if (typeof t.amountPaid === "number" && t.amountPaid > 0) return t.amountPaid;
    let fee = 0;
    const members = [t.leader, t.member2, t.member3, t.member4, t.member5];
    members.forEach((m) => {
      if (m && m.name) {
        fee += m.residentialStatus === "Day Scholar" ? 219 : 100;
      }
    });
    return fee || 100;
  };

  const verifiedEarnings = paginatedTeams
    .filter((t) => t.paymentStatus === "verified")
    .reduce((sum, t) => sum + calcTeamFee(t), 0);

  const potentialEarnings = paginatedTeams.reduce((sum, t) => sum + calcTeamFee(t), 0);

  const submittedTeams = paginatedTeams.filter((t) => !!t.project);
  const leaderboardTeams = [...submittedTeams].sort((a, b) => {
    const scoreA = a.project?.score?.total || 0;
    const scoreB = b.project?.score?.total || 0;
    return scoreB - scoreA;
  });

  const handleOpenScoreModal = (team: Team) => {
    setSelectedScoringTeam(team);
    if (team.project?.score) {
      setScores({
        innovation: team.project.score.innovation,
        technicalComplexity: team.project.score.technicalComplexity,
        uiUx: team.project.score.uiUx,
        presentation: team.project.score.presentation,
        impact: team.project.score.impact,
        feedback: team.project.score.feedback || "",
      });
    } else {
      setScores({
        innovation: 18,
        technicalComplexity: 18,
        uiUx: 17,
        presentation: 18,
        impact: 18,
        feedback: "Solid implementation and architecture.",
      });
    }
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoringTeam) return;
    onScoreProject(selectedScoringTeam.id, scores);
    setSelectedScoringTeam(null);
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    onSendAnnouncement(annTitle, annMessage, annCategory);
    setAnnTitle("");
    setAnnMessage("");
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
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

  // ----- Render: Not authenticated -----
  if (!currentAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16">
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 text-orange-400 font-mono text-[11px] font-bold border border-orange-500/30 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>AUTHENTICATED ORGANIZER CONSOLE</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Origin '26 Executive Admin Console
          </h3>

          {firebaseUser?.email ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono text-left space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>ACCESS DENIED — NOT AN AUTHORIZED ADMIN</span>
                </div>
                <p>
                  You are currently signed in as <strong className="text-white">{firebaseUser.email}</strong>, but this email address is not in the Authorized Admin Whitelist.
                </p>
                <p className="text-[11px] text-neutral-400">
                  If you are an organizer or convener, please request access from the Lead Convener or Superadmin.
                </p>
              </div>

              <button
                onClick={() => handleSignOut()}
                className="w-full py-3 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign Out of Firebase to Switch Account</span>
              </button>
            </div>
          ) : (
            <div className="space-y-5 pt-2 text-left">
              <p className="text-xs text-neutral-400 text-center max-w-md mx-auto leading-relaxed">
                Please sign in using your authorized executive or jury email address to access administrative management tools.
              </p>

              {authError && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-mono flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  setAuthError("");
                  try {
                    await signInWithGoogle();
                  } catch (err: any) {
                    if (err.code !== "auth/popup-closed-by-user") {
                      setAuthError(err.message || "Google sign in failed.");
                    }
                  }
                }}
                className="w-full py-3 px-4 bg-[#171717] hover:bg-[#222222] border border-[#262626] hover:border-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-3 group"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                </svg>
                <span className="group-hover:text-orange-400 transition-colors">
                  Sign In with Google
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-800"></div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">OR ADMIN EMAIL / PASSWORD</span>
                <div className="flex-1 h-px bg-neutral-800"></div>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthError("");
                  if (!emailInput.trim() || !otpInput.trim()) {
                    setAuthError("Please enter both your admin email and password.");
                    return;
                  }
                  try {
                    await signInWithEmail(emailInput.trim(), otpInput.trim());
                  } catch (err: any) {
                    setAuthError(err.message || "Failed to authenticate.");
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1 tracking-wider">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="neelpandeyofficial@gmail.com"
                    className="w-full bg-[#171717] border border-neutral-800 focus:border-orange-500 px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-semibold uppercase text-neutral-300 mb-1 tracking-wider">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#171717] border border-neutral-800 focus:border-orange-500 px-3 py-2.5 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-orange-500 shadow-lg shadow-orange-500/20 mt-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate Admin</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- Authenticated view -----
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-8">
      {/* Header */}
      <div className="bg-black border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
              OPERATIONS COMMAND CONSOLE
            </span>
            <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-mono font-bold border border-orange-500/30 uppercase tracking-wider">
              {currentAdmin.role.toUpperCase()}
            </span>
            <span className="px-2.5 py-0.5 bg-black text-neutral-400 text-[10px] font-mono border border-neutral-800 hidden sm:inline uppercase">
              {currentAdmin.department || "Data Science Club"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2" style={{ fontFamily: "var(--font-heading)" }}>
            Origin Overnight Command Hub
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
            <span className="text-orange-400 flex items-center gap-1 font-semibold">
              <UserCheck className="w-3.5 h-3.5" /> {currentAdmin.name}
            </span>
            <span>•</span>
            <span className="text-neutral-300">{currentAdmin.email}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isDeadlinePassed && (
            <span className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Deadline Passed (Backend Locked)</span>
            </span>
          )}

          <button
            id="admin-btn-toggle-registrations"
            onClick={handleToggleRegistrations}
            disabled={isTogglingRegistrations}
            className={`px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer border ${
              isRegistrationsOpen
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                : "bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-700"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {isTogglingRegistrations
                ? "Updating..."
                : isRegistrationsOpen
                ? "Registrations: OPEN (Click to Stop)"
                : "Registrations: STOPPED (Click to Open)"}
            </span>
          </button>

          <button
            id="admin-btn-toggle-submissions"
            onClick={handleToggleSubmissions}
            disabled={isTogglingSubmissions}
            className={`px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer border ${
              isSubmissionsOpen
                ? "bg-orange-600 hover:bg-orange-500 text-white border-orange-500"
                : "bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {isTogglingSubmissions
                ? "Updating..."
                : isSubmissionsOpen
                ? "Submissions: OPEN (Click to Lock)"
                : "Submissions: CLOSED (Click to Open)"}
            </span>
          </button>

          <button
            id="admin-btn-export-excel"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-orange-500" />
            <span>Export Excel</span>
          </button>

          <button
            id="admin-btn-clear-db"
            onClick={handleClearDatabase}
            disabled={isClearingDb}
            className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>{isClearingDb ? "Clearing DB..." : "Reset DB Data"}</span>
          </button>

          <button
            id="admin-btn-export-csv"
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-orange-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Sign out from this admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-neutral-800 border border-neutral-800">
        <div className="bg-black p-5">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Total Teams</span>
          <div className="text-3xl font-extrabold text-white font-mono">{pagination.total}</div>
        </div>
        <div className="bg-black p-5">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Verified Badges</span>
          <div className="text-3xl font-extrabold text-orange-500 font-mono">
            {paginatedTeams.filter((t) => t.paymentStatus === "verified").length}
          </div>
        </div>
        <div className="bg-black p-5">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Pending Review</span>
          <div className="text-3xl font-extrabold text-amber-500 font-mono">
            {paginatedTeams.filter((t) => t.paymentStatus === "pending").length}
          </div>
        </div>
        <div className="bg-black p-5 border-l border-neutral-800 bg-emerald-950/20">
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 font-bold">Live Verified Revenue</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">₹{verifiedEarnings.toLocaleString("en-IN")}</div>
          <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">Potential: ₹{potentialEarnings.toLocaleString("en-IN")}</span>
        </div>
        <div className="bg-black p-5">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Submissions</span>
          <div className="text-3xl font-extrabold text-orange-400 font-mono">{submittedTeams.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-800">
        <button
          onClick={() => setAdminTab("teams")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
            adminTab === "teams"
              ? "bg-orange-600 text-white border-orange-500"
              : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          <span>Teams ({pagination.total})</span>
        </button>

        <button
          onClick={() => setAdminTab("submissions")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
            adminTab === "submissions"
              ? "bg-orange-600 text-white border-orange-500"
              : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 inline mr-1.5" />
          <span>24H Submissions ({submittedTeams.length})</span>
        </button>

        <button
          onClick={() => setAdminTab("leaderboard")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
            adminTab === "leaderboard"
              ? "bg-orange-600 text-white border-orange-500"
              : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4 inline mr-1.5" />
          <span>Jury Leaderboard</span>
        </button>

        <button
          onClick={() => setAdminTab("broadcast")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
            adminTab === "broadcast"
              ? "bg-orange-600 text-white border-orange-500"
              : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <Radio className="w-4 h-4 inline mr-1.5" />
          <span>Live Broadcasts</span>
        </button>

        <button
          onClick={() => setAdminTab("access")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
            adminTab === "access"
              ? "bg-orange-600 text-white border-orange-500"
              : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4 inline mr-1.5" />
          <span>Admin Whitelist ({adminWhitelist.length})</span>
        </button>
      </div>

      {/* TEAMS TAB – modified: removed Track column, UTR column, Action column; simplified payment status (no badge) */}
      {adminTab === "teams" && (
        <div className="space-y-4">
          {/* Search & Filters – removed track filter dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black p-4 border border-neutral-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search Team ID, Team Name, Leader Name, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono placeholder:text-neutral-600"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black border border-neutral-800 px-3 py-2 text-xs text-white font-mono focus:border-orange-500 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Only</option>
                <option value="pending">Pending Only</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table – columns: Team & ID, Leader Details, Payment, Check-In */}
          <div className="bg-black border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900 text-neutral-500 font-mono uppercase text-[11px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Team & ID</th>
                  <th className="p-3.5">Leader Details</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono">
                      Loading teams...
                    </td>
                  </tr>
                ) : paginatedTeams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono">
                      No teams match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-neutral-950 transition-colors text-neutral-300">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{team.teamName}</div>
                        <div className="font-mono text-[10px] text-orange-500">{team.id}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-white font-medium flex items-center gap-1.5 flex-wrap">
                          <span>{team.leader.name}</span>
                          {team.leader.registrationNumber && (
                            <span className="text-[9px] text-orange-400 font-mono font-normal bg-orange-500/10 px-1 py-0.2 border border-orange-500/20">
                              {team.leader.registrationNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">{team.leader.email}</div>
                        <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 flex-wrap mt-0.5">
                          <span>{team.leader.phone}</span>
                          {team.leader.residentialStatus && (
                            <span className="text-[9px] text-neutral-400 border border-neutral-800 px-1 py-0.2 uppercase">
                              {team.leader.residentialStatus}
                            </span>
                          )}
                          {team.leader.messName && (
                            <span className="text-[9px] text-amber-400/90 border border-amber-500/20 px-1 py-0.2">
                              {team.leader.messName}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-xs font-mono">
                          {team.paymentStatus === "verified" ? (
                            <span className="text-emerald-400">Verified</span>
                          ) : team.paymentStatus === "pending" ? (
                            <span className="text-amber-400">Pending</span>
                          ) : (
                            <span className="text-rose-400">Rejected</span>
                          )}
                        </div>
                        <div className="font-bold text-white font-mono mt-1 text-xs">
                          <span className="text-orange-400">₹{calcTeamFee(team)}</span>
                          <span className="text-[9px] text-neutral-500 uppercase ml-1 font-normal">paid</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={team.checkedInVenue}
                          onChange={(e) =>
                            onUpdateTeamStatus(team.id, {
                              checkedInVenue: e.target.checked,
                            })
                          }
                          className="bg-black border-neutral-800 text-orange-500 focus:ring-0 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        </div>
      )}

      {/* SUBMISSIONS TAB (unchanged) */}
      {adminTab === "submissions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
            {submittedTeams.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-neutral-500 bg-black">
                <FileText className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
                <div className="font-bold text-white font-mono">No 24H Project Submissions Yet</div>
                <p className="text-xs text-neutral-400 mt-1 font-mono">Teams will submit deliverables during the sprint.</p>
              </div>
            ) : (
              submittedTeams.map((team) => {
                const proj = team.project!;
                const isScored = !!proj.score;

                return (
                  <div
                    key={team.id}
                    className="bg-black p-6 space-y-4 hover:bg-neutral-950 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-orange-400 font-bold px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 uppercase tracking-wider">
                          {team.id}
                        </span>
                        {isScored ? (
                          <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 border border-orange-500/30">
                            Score: {proj.score?.total}/100
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30 uppercase tracking-wider">
                            Pending Evaluation
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>{proj.title}</h4>
                      <p className="text-xs text-neutral-400 italic">{proj.tagline || "No tagline provided"}</p>
                      <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">{proj.solutionDescription}</p>

                      <div className="flex flex-wrap gap-1 pt-1 font-mono">
                        {proj.techStack?.map((t, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-black border border-neutral-800 text-neutral-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-900 space-y-3 font-mono">
                      {/* Attachment Links */}
                      {(proj.presentationPdfUrl || proj.presentationPptUrl) && (
                        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-neutral-800/50">
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

                      <div className="flex items-center justify-between text-xs">
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline flex items-center gap-1 text-[11px]">
                          <GitBranch className="w-3.5 h-3.5" /> Repository &rarr;
                        </a>
                        {proj.deploymentUrl && (
                          <a href={proj.deploymentUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]">
                            <Globe className="w-3.5 h-3.5" /> Live Demo &rarr;
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenScoreModal(team)}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider border border-orange-500 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-mono"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{isScored ? "Update Jury Score" : "Grade / Evaluate Project"}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls for Submissions */}
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
        </div>
      )}

      {/* LEADERBOARD TAB (unchanged) */}
      {adminTab === "leaderboard" && (
        <div className="space-y-4">
          <div className="bg-black border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 text-neutral-500 uppercase text-[11px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Project & Team</th>
                  <th className="p-3.5">Track</th>
                  <th className="p-3.5">Innovation</th>
                  <th className="p-3.5">Tech Depth</th>
                  <th className="p-3.5">UI/UX</th>
                  <th className="p-3.5">Pitch</th>
                  <th className="p-3.5">Impact</th>
                  <th className="p-3.5 font-bold text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {leaderboardTeams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-neutral-500">
                      No evaluated submissions available for the leaderboard yet.
                    </td>
                  </tr>
                ) : (
                  leaderboardTeams.map((team, idx) => {
                    const score = team.project?.score;
                    return (
                      <tr key={team.id} className="hover:bg-neutral-950 transition-colors text-neutral-300">
                        <td className="p-3.5 font-bold">
                          <span className="w-6 h-6 inline-flex items-center justify-center text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/30">
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-heading)" }}>{team.project?.title}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{team.teamName} ({team.id})</div>
                        </td>
                        <td className="p-3.5 text-neutral-300">{team.track}</td>
                        <td className="p-3.5 text-neutral-400">{score ? `${score.innovation}/20` : "-"}</td>
                        <td className="p-3.5 text-neutral-400">{score ? `${score.technicalComplexity}/20` : "-"}</td>
                        <td className="p-3.5 text-neutral-400">{score ? `${score.uiUx}/20` : "-"}</td>
                        <td className="p-3.5 text-neutral-400">{score ? `${score.presentation}/20` : "-"}</td>
                        <td className="p-3.5 text-neutral-400">{score ? `${score.impact}/20` : "-"}</td>
                        <td className="p-3.5 text-right font-bold text-base text-orange-400">
                          {score ? `${score.total}/100` : "Unscored"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BROADCAST TAB (unchanged) */}
      {adminTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <Radio className="w-5 h-5 text-orange-500" />
                <span>Send Real-Time Broadcast</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Dispatches immediately to the live ticker banner across all participant screens.</p>
            </div>

            {annSuccess && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Broadcast message dispatched live!</span>
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Alert Category</label>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                >
                  <option value="urgent">🚨 Urgent / Crucial Milestone</option>
                  <option value="schedule">⏰ Schedule & Deadline Alert</option>
                  <option value="food">🍕 Midnight Meals & Refreshments</option>
                  <option value="mentorship">💡 Mentorship & Jury Hours</option>
                  <option value="general">📢 General Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Code Freeze in 60 Minutes!"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Broadcast Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="All teams must commit repository branches and finalize demo URLs..."
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2.5 text-white resize-none focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono text-xs uppercase tracking-wider border border-orange-500 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Send className="w-4 h-4" />
                <span>Publish Broadcast Alert</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-sm font-bold text-white mb-2" style={{ fontFamily: "var(--font-heading)" }}>Live Announcement Feed</h4>
            {announcements.length === 0 ? (
              <div className="p-6 bg-black border border-neutral-800 text-center text-xs font-mono text-neutral-500">
                No active announcements published.
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-4 bg-black border border-neutral-800 space-y-1.5 relative group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white font-mono">{ann.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-500">{ann.timestamp}</span>
                      {onDeleteAnnouncement && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete announcement "${ann.title}"?`)) {
                              onDeleteAnnouncement(ann.id);
                            }
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{ann.message}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                    <span className="text-orange-400">Sent by: {ann.sender}</span>
                    <span className="text-neutral-600 uppercase">Category: {ann.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ACCESS TAB (unchanged) */}
      {adminTab === "access" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  <ShieldCheck className="w-5 h-5 text-orange-500" />
                  <span>Authorized Email Whitelist</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1 font-mono">Only email addresses listed here can access the Admin Console and Jury Evaluation sheets.</p>
              </div>
              <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 border border-orange-500/30 uppercase tracking-wider">
                {adminWhitelist.length} Admins
              </span>
            </div>

            <div className="space-y-3 font-mono">
              {adminWhitelist.map((admin) => {
                const isSelf = currentAdmin.email.toLowerCase() === admin.email.toLowerCase();
                return (
                  <div key={admin.email} className="p-4 bg-black border border-neutral-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 bg-black border border-neutral-800 flex items-center justify-center text-orange-500 font-mono text-sm font-bold shrink-0">
                        {admin.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{admin.name}</span>
                          {isSelf && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-orange-500/10 text-orange-400 font-mono font-bold border border-orange-500/30">YOU</span>
                          )}
                          <span className="text-[10px] px-2 py-0.2 bg-black text-neutral-400 font-mono border border-neutral-800 uppercase">{admin.role}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-400 truncate">{admin.email}</div>
                        <div className="text-[10px] text-neutral-500">{admin.department || "Data Science Club"}</div>
                      </div>
                    </div>
                    {!isSelf && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.email)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5 font-mono">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                <UserPlus className="w-5 h-5 text-orange-500" />
                <span>Authorize New Email</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">Grant executive council or jury evaluation privileges to an official email.</p>
            </div>

            {addAdminSuccess && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4" />
                <span>{addAdminSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddNewAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Official Email Address *</label>
                <input type="email" required placeholder="e.g. mentor.ai@vitbhopal.ac.in" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Full Name *</label>
                <input type="text" required placeholder="e.g. Prof. Priya Sharma" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Administrative Role</label>
                <select value={newAdminRole} onChange={(e) => setNewAdminRole(e.target.value as any)} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500">
                  <option value="Lead Organizer">Lead Organizer (DSC Core)</option>
                  <option value="Jury Chair">Jury Member / Evaluator</option>
                  <option value="Operations Lead">Operations & Check-In Lead</option>
                  <option value="Faculty Advisor">Faculty Coordinator</option>
                  <option value="Superadmin">Superadmin</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Department / Organization</label>
                <input type="text" placeholder="e.g. Data Science Club or Dept of AI" value={newAdminDept} onChange={(e) => setNewAdminDept(e.target.value)} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500" />
              </div>
              <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono text-xs uppercase tracking-wider border border-orange-500 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Add Email to Authorized Whitelist</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals – only the scoring modal and payment proof modal are kept; removed the old proof modal because UTR column removed, but we keep it for completeness */}
      {selectedProofTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-neutral-800 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h4 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Payment Screenshot & UTR</h4>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedProofTeam.teamName} ({selectedProofTeam.id})</p>
              </div>
              <button onClick={() => setSelectedProofTeam(null)} className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase">✕ Close</button>
            </div>
            <div className="bg-black p-3 text-xs font-mono space-y-1 border border-neutral-800">
              <div>Transaction Ref: <span className="text-orange-400 font-bold">{selectedProofTeam.transactionRef}</span></div>
              <div>Leader: {selectedProofTeam.leader.name} ({selectedProofTeam.leader.phone})</div>
            </div>
            {selectedProofTeam.paymentProofUrl ? (
              <div className="max-h-72 overflow-auto border border-neutral-800 flex justify-center bg-black p-2">
                <img src={selectedProofTeam.paymentProofUrl} alt="Payment Proof" className="max-h-64 object-contain" />
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-500 text-xs font-mono">No screenshot file was uploaded. Verified via direct UTR ref.</div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2 font-mono">
              <button onClick={() => { onUpdateTeamStatus(selectedProofTeam.id, { paymentStatus: "rejected" }); setSelectedProofTeam(null); }} className="px-4 py-2 bg-black border border-neutral-800 hover:bg-rose-950 text-rose-400 text-xs font-bold uppercase cursor-pointer">Reject Proof</button>
              <button onClick={() => { onUpdateTeamStatus(selectedProofTeam.id, { paymentStatus: "verified", ticketIssued: true }); setSelectedProofTeam(null); }} className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white border border-orange-500 text-xs font-bold uppercase tracking-wider cursor-pointer">Approve & Issue ID Badge</button>
            </div>
          </div>
        </div>
      )}

      {selectedScoringTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black border border-neutral-800 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h4 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>Jury Evaluation Sheet</h4>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedScoringTeam.project?.title} • {selectedScoringTeam.teamName}</p>
              </div>
              <button onClick={() => setSelectedScoringTeam(null)} className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase">✕ Close</button>
            </div>
            <form onSubmit={handleSaveScore} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Innovation (/20)</label>
                  <input type="number" min="0" max="20" value={scores.innovation} onChange={(e) => setScores({ ...scores, innovation: Number(e.target.value) })} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Tech Depth (/20)</label>
                  <input type="number" min="0" max="20" value={scores.technicalComplexity} onChange={(e) => setScores({ ...scores, technicalComplexity: Number(e.target.value) })} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">UI/UX (/20)</label>
                  <input type="number" min="0" max="20" value={scores.uiUx} onChange={(e) => setScores({ ...scores, uiUx: Number(e.target.value) })} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Presentation (/20)</label>
                  <input type="number" min="0" max="20" value={scores.presentation} onChange={(e) => setScores({ ...scores, presentation: Number(e.target.value) })} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500" />
                </div>
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Impact & Feasibility (/20)</label>
                <input type="number" min="0" max="20" value={scores.impact} onChange={(e) => setScores({ ...scores, impact: Number(e.target.value) })} className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Jury Feedback / Recommendations</label>
                <textarea rows={2} value={scores.feedback} onChange={(e) => setScores({ ...scores, feedback: e.target.value })} placeholder="Outstanding work on the model quantization..." className="w-full bg-black border border-neutral-800 p-2.5 text-white resize-none placeholder:text-neutral-600 focus:border-orange-500 outline-none" />
              </div>
              <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 flex items-center justify-between font-mono">
                <span className="text-orange-400 font-bold uppercase tracking-wider text-[11px]">TOTAL SCORE:</span>
                <span className="text-base font-extrabold text-white">{scores.innovation + scores.technicalComplexity + scores.uiUx + scores.presentation + scores.impact} / 100</span>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 font-mono">
                <button type="button" onClick={() => setSelectedScoringTeam(null)} className="px-4 py-2 bg-black border border-neutral-800 text-neutral-300 text-xs uppercase cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider border border-orange-500 cursor-pointer">Save Score & Update Rank</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};