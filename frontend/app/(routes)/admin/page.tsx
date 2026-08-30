"use client";

import { AdminPortal } from "@/components/admin/AdminPortal";
import { useTeams } from "@/hooks/useTeams";

export default function AdminPage() {
  const { teams, announcements, refreshData } = useTeams();

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
      await fetch(`/api/teams/${teamId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(status),
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
      await fetch(`/api/teams/${teamId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminHeaders(),
        },
        body: JSON.stringify(score),
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

  return (
    <AdminPortal
      teams={teams}
      announcements={announcements}
      onUpdateTeamStatus={handleUpdateTeamStatus}
      onScoreProject={handleScoreProject}
      onDeleteTeam={handleDeleteTeam}
      onSendAnnouncement={handleSendAnnouncement}
      onRefreshData={refreshData}
    />
  );
}