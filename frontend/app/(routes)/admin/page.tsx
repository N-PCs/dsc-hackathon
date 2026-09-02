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
  } = useTeams();

  // Local state for filters (mirroring the AdminPortal's internal state)
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
      // Refetch paginated data
      fetchPaginated({
        page: currentPage,
        limit: pageSize,
        search,
        status: statusFilter,
        track: trackFilter,
      });
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
      refreshData(); // refresh announcements
    } catch (err) {
      console.error("Failed to send announcement:", err);
    }
  };

  // ✅ NEW: Delete announcement handler
  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const res = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
        headers: {
          ...getAdminHeaders(),
        },
      });
      if (res.ok) {
        refreshData(); // refresh announcements and other data
      } else {
        console.error("Failed to delete announcement");
      }
    } catch (err) {
      console.error("Failed to delete announcement:", err);
    }
  };

  return (
    <AdminPortal
      paginatedTeams={paginatedTeams}
      pagination={pagination}
      isLoading={isLoadingPaginated}
      announcements={announcements}
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
      onDeleteAnnouncement={handleDeleteAnnouncement} // ← pass the new handler
      onRefreshData={refreshData}
    />
  );
}