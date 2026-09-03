"use client";

import React, { useEffect, useState } from "react";
import { Team, Announcement, PaymentStatus, HackathonStats } from "@/types";

import { useAdminAuth } from "./hooks/useAdminAuth";
import { useSubmissions } from "./hooks/useSubmissions";
import { calcTeamFee } from "./utils";
import { ScorePayload } from "./ScoringModal"; 

import { AdminLogin } from "./AdminLogin";
import { AdminHeader } from "./AdminHeader";
import { AdminStatsGrid } from "./AdminStatsGrid";
import { AdminTabsNav, AdminTab } from "./AdminTabsNav";
import { TeamsTab } from "./TeamsTab";
import { SubmissionsTab } from "./SubmissionsTab";
import { LeaderboardTab } from "./LeaderboardTab";
import { BroadcastTab } from "./BroadcastTab";
import { AccessTab } from "./AccessTab";
import { PaymentProofModal } from "./PaymentProofModal";

interface AdminPortalProps {
  paginatedTeams: Team[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  isLoading: boolean;
  announcements: Announcement[];
  stats?: HackathonStats;
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
  onUpdateTeamStatus: (
    teamId: string,
    status: { paymentStatus?: PaymentStatus; checkedInVenue?: boolean; ticketIssued?: boolean; notes?: string }
  ) => void;
  onScoreProject: (teamId: string, score: ScorePayload) => void; 
  onDeleteTeam: (teamId: string) => void;
  onSendAnnouncement: (title: string, message: string, category: "urgent" | "schedule" | "food" | "mentorship" | "general") => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  onRefreshData: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  paginatedTeams,
  pagination,
  isLoading,
  announcements,
  stats,
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
  onExportExcel,
  onExportCsv,
}) => {
  const auth = useAdminAuth();
  const {
    currentAdmin,
    hasHydrated,
    firebaseUser,
    signInWithGoogle,
    signInWithEmail,
    authError,
    setAuthError,
    emailInput,
    setEmailInput,
    otpInput,
    setOtpInput,
    handleSignOut,
    adminWhitelist,
    newAdminEmail,
    setNewAdminEmail,
    newAdminName,
    setNewAdminName,
    newAdminRole,
    setNewAdminRole,
    newAdminDept,
    setNewAdminDept,
    addAdminSuccess,
    handleAddNewAdmin,
    handleRemoveAdmin,
  } = auth;

  const [adminTab, setAdminTab] = useState<AdminTab>("teams");

  const { allSubmissions, isLoadingSubmissions, fetchAllSubmissions } = useSubmissions(currentAdmin, adminTab);

  const [selectedProofTeam, setSelectedProofTeam] = useState<Team | null>(null);

  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isRegistrationsOpen, setIsRegistrationsOpen] = useState(true);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
  const [isTogglingSubmissions, setIsTogglingSubmissions] = useState(false);
  const [isTogglingRegistrations, setIsTogglingRegistrations] = useState(false);

  // --- Fetch statuses (public endpoints) ---
  useEffect(() => {
    fetch("/api/admin/submissions-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsSubmissionsOpen(data.submissionsOpen);
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
  }, []);

  const handleToggleSubmissions = async () => {
    if (!currentAdmin) return;
    const nextState = !isSubmissionsOpen;
    setIsTogglingSubmissions(true);
    try {
      const res = await fetch("/api/admin/submissions-toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-email": currentAdmin.email },
        body: JSON.stringify({ submissionsOpen: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) setIsSubmissionsOpen(data.submissionsOpen);
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
        headers: { "Content-Type": "application/json", "x-admin-email": currentAdmin.email },
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

  const adminQuery = currentAdmin ? `?adminEmail=${encodeURIComponent(currentAdmin.email)}` : "";
  const handleExportExcel = () => window.open(`/api/export-excel${adminQuery}`, "_blank");
  const handleExportCsv = () => window.open(`/api/export-csv${adminQuery}`, "_blank");

  // Compute earnings from the current page only (since stats doesn't have revenue)
  const pageVerifiedEarnings = paginatedTeams
    .filter((t) => t.paymentStatus === "verified")
    .reduce((sum, t) => sum + calcTeamFee(t), 0);
  const pagePotentialEarnings = paginatedTeams.reduce((sum, t) => sum + calcTeamFee(t), 0);

  // ✅ Use page-based earnings (stats doesn't have revenue fields)
  const verifiedEarnings = pageVerifiedEarnings;
  const potentialEarnings = pagePotentialEarnings;

  const totalTeamsCount = stats?.totalTeams ?? pagination.total;
  const checkedInCount = stats?.checkedInTeams ?? 0;
  const pendingCount = stats?.pendingTeams ?? 0;
  const submissionsCount = stats?.submittedProjects ?? allSubmissions.length;

  const submittedTeams = allSubmissions;
  const leaderboardTeams = [...allSubmissions].sort((a, b) => {
    const scoreA = a.project?.score?.total || 0;
    const scoreB = b.project?.score?.total || 0;
    return scoreB - scoreA;
  });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (!hasHydrated) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!currentAdmin) {
    return (
      <AdminLogin
        firebaseUser={firebaseUser}
        authError={authError}
        setAuthError={setAuthError}
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        otpInput={otpInput}
        setOtpInput={setOtpInput}
        signInWithGoogle={signInWithGoogle}
        signInWithEmail={signInWithEmail}
        handleSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-8">
      <AdminHeader
        currentAdmin={currentAdmin}
        isDeadlinePassed={isDeadlinePassed}
        isRegistrationsOpen={isRegistrationsOpen}
        isSubmissionsOpen={isSubmissionsOpen}
        isTogglingRegistrations={isTogglingRegistrations}
        isTogglingSubmissions={isTogglingSubmissions}
        onToggleRegistrations={handleToggleRegistrations}
        onToggleSubmissions={handleToggleSubmissions}
        onRefresh={() => {
          onRefreshData();
          fetchAllSubmissions(true);
        }}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onSignOut={handleSignOut}
      />

      <AdminStatsGrid
        totalTeamsCount={totalTeamsCount}
        checkedInCount={checkedInCount}
        submissionsCount={submissionsCount}
      />

      <AdminTabsNav
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        teamsTotal={pagination.total}
        submissionsCount={submittedTeams.length}
        whitelistCount={adminWhitelist.length}
      />

      {adminTab === "teams" && (
        <TeamsTab
          paginatedTeams={paginatedTeams}
          pagination={pagination}
          isLoading={isLoading}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={handlePageSizeChange}
          onUpdateTeamStatus={onUpdateTeamStatus}
          onDeleteTeam={onDeleteTeam}
          onViewProof={setSelectedProofTeam}
        />
      )}

      {adminTab === "submissions" && (
        <SubmissionsTab
          submittedTeams={submittedTeams}
          isLoadingSubmissions={isLoadingSubmissions}
        />
      )}

      {adminTab === "leaderboard" && (
        <LeaderboardTab leaderboardTeams={leaderboardTeams} isLoadingSubmissions={isLoadingSubmissions} />
      )}

      {adminTab === "broadcast" && (
        <BroadcastTab
          announcements={announcements}
          onSendAnnouncement={onSendAnnouncement}
          onDeleteAnnouncement={onDeleteAnnouncement}
        />
      )}

      {adminTab === "access" && (
        <AccessTab
          adminWhitelist={adminWhitelist}
          currentAdmin={currentAdmin}
          newAdminEmail={newAdminEmail}
          setNewAdminEmail={setNewAdminEmail}
          newAdminName={newAdminName}
          setNewAdminName={setNewAdminName}
          newAdminRole={newAdminRole}
          setNewAdminRole={setNewAdminRole}
          newAdminDept={newAdminDept}
          setNewAdminDept={setNewAdminDept}
          addAdminSuccess={addAdminSuccess}
          onAddAdmin={handleAddNewAdmin}
          onRemoveAdmin={handleRemoveAdmin}
        />
      )}

      {selectedProofTeam && (
        <PaymentProofModal
          team={selectedProofTeam}
          onClose={() => setSelectedProofTeam(null)}
          onUpdateTeamStatus={onUpdateTeamStatus}
        />
      )}
    </div>
  );
};