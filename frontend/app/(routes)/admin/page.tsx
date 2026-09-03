"use client";

import { AdminPortal } from "@/components/admin/AdminPortal";
import { useTeams } from "@/hooks/useTeams";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const {
    paginatedTeams,
    pagination,
    isLoadingPaginated,
    fetchPaginated,
    refreshData,
    announcements,
    stats,
  } = useTeams();

  // Local state for filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch when any filter changes
  useEffect(() => {
    fetchPaginated({
      page: currentPage,
      limit: pageSize,
      search,
      status: statusFilter,
      track: trackFilter,
    });
  }, [currentPage, pageSize, search, statusFilter, trackFilter, fetchPaginated]);

  // Helper to get admin email from localStorage
  const getAdminEmail = (): string => {
    try {
      const saved = localStorage.getItem("origin_active_admin");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          return String(parsed.email);
        }
      }
    } catch (_e) {}
    return "";
  };

  // Helper to get admin headers
  const getAdminHeaders = (): Record<string, string> => {
    const email = getAdminEmail();
    return email ? { "x-admin-email": email } : {};
  };

  const handleUpdateTeamStatus = async (
    teamId: string,
    status: {
      paymentStatus?: "pending" | "verified" | "rejected";
      checkedInVenue?: boolean;
      ticketIssued?: boolean;
      notes?: string;
    }
  ) => {
    try {
      await fetch(`/api/admin/teams/${teamId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(status),
      });
      fetchPaginated({
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        track: trackFilter,
      });
      refreshData();
    } catch (err) {
      console.error("Failed to update team status:", err);
    }
  };

  const handleScoreProject = async (
    teamId: string,
    score: {
      innovation: number;
      technicalComplexity: number;
      uiUx: number;
      presentation: number;
      impact: number;
      feedback: string;
    }
  ) => {
    try {
      await fetch(`/api/admin/teams/${teamId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(score),
      });
      fetchPaginated({
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        track: trackFilter,
      });
      refreshData();
    } catch (err) {
      console.error("Failed to score project:", err);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          ...getAdminHeaders(),
        },
      });
      fetchPaginated({
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        track: trackFilter,
      });
      refreshData();
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  const handleSendAnnouncement = async (
    title: string,
    message: string,
    category: "urgent" | "schedule" | "food" | "mentorship" | "general"
  ) => {
    try {
      await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify({ title, message, category }),
      });
      refreshData();
    } catch (err) {
      console.error("Failed to send announcement:", err);
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const res = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
        headers: {
          ...getAdminHeaders(),
        },
      });
      if (res.ok) {
        refreshData();
      } else {
        console.error("Failed to delete announcement");
      }
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  // Export handlers
  const handleExportExcel = async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      alert("Admin email not found. Please log in again.");
      return;
    }
    try {
      const res = await fetch(`/api/export-excel?adminEmail=${encodeURIComponent(adminEmail)}`, {
        headers: { 'x-admin-email': adminEmail },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `origin-teams-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export Excel. Please try again.');
    }
  };

  const handleExportCsv = async () => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      alert("Admin email not found. Please log in again.");
      return;
    }
    try {
      const res = await fetch(`/api/export-csv?adminEmail=${encodeURIComponent(adminEmail)}`, {
        headers: { 'x-admin-email': adminEmail },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `origin-teams-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <AdminPortal
      paginatedTeams={paginatedTeams}
      pagination={pagination}
      isLoading={isLoadingPaginated}
      announcements={announcements}
      stats={stats}
      search={search}
      setSearch={setSearch}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      trackFilter={trackFilter}
      setTrackFilter={setTrackFilter}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      onUpdateTeamStatus={handleUpdateTeamStatus}
      onScoreProject={handleScoreProject}
      onDeleteTeam={handleDeleteTeam}
      onSendAnnouncement={handleSendAnnouncement}
      onDeleteAnnouncement={handleDeleteAnnouncement}
      onRefreshData={refreshData}
      onExportExcel={handleExportExcel}
      onExportCsv={handleExportCsv}
    />
  );
}