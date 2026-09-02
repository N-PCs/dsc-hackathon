"use client";

import { JuryPortal } from "@/components/jury/JuryPortal";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

// Storage key must match the one used in JuryPortal
const FILTER_STORAGE_KEY = "origin_jury_filters";

const getJuryEmail = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("origin_jury_email") || "";
  }
  return "";
};

// Load filter state from sessionStorage (same as JuryPortal)
const loadFilterState = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FILTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        page: parsed.page || 1,
        limit: parsed.limit || 10,
        search: parsed.search || "",
        track: parsed.track || "all",
        status: (parsed.status as "all" | "evaluated" | "pending") || "all",
      };
    }
  } catch (_) {}
  return null;
};

export default function JuryPage() {
  const {
    paginatedTeams,
    pagination,
    isLoadingPaginated,
    fetchPaginated,
    refreshData,
  } = useTeams();

  // Initialize filters from sessionStorage (if available)
  const savedFilters = loadFilterState();
  const [filters, setFilters] = useState(() => ({
    page: savedFilters?.page || 1,
    limit: savedFilters?.limit || 10,
    search: savedFilters?.search || "",
    track: savedFilters?.track || "all",
    status: (savedFilters?.status as "all" | "evaluated" | "pending") || "all",
  }));

  // ✅ Memoize to prevent unnecessary re‑renders in child
  const handleFetchData = useCallback((newFilters: {
    page: number;
    limit: number;
    search: string;
    track: string;
    status: "all" | "evaluated" | "pending";
  }) => {
    setFilters(newFilters);
  }, []);

  // Fetch whenever filters change
  useEffect(() => {
    const scoredMap: Record<string, 'all' | 'true' | 'false'> = {
      all: 'all',
      evaluated: 'true',
      pending: 'false',
    };
    fetchPaginated({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      track: filters.track,
      status: "all",
      hasProject: true,
      scored: scoredMap[filters.status],
    });
  }, [filters, fetchPaginated]);

  // ✅ Memoize refresh callback
  const handleRefresh = useCallback(() => {
    const scoredMap: Record<string, 'all' | 'true' | 'false'> = {
      all: 'all',
      evaluated: 'true',
      pending: 'false',
    };
    fetchPaginated({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      track: filters.track,
      status: "all",
      hasProject: true,
      scored: scoredMap[filters.status],
    });
  }, [filters, fetchPaginated]);

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
    const juryEmail = getJuryEmail();
    if (!juryEmail) {
      alert(
        "⚠️ Jury email not found. Please log in again to the Jury Portal.\n\n" +
        "Click 'Exit Portal' and re-enter your email and passcode."
      );
      return;
    }

    try {
      const res = await fetch(`/api/jury/teams/${teamId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-jury-email": juryEmail,
        },
        body: JSON.stringify(score),
      });
      if (res.ok) {
        handleRefresh();
        alert("✅ Score saved successfully!");
      } else {
        const err = await res.json();
        console.error("Scoring failed:", err);
        if (err.message?.includes("not authorized") || res.status === 403) {
          alert(
            `❌ Your jury email "${juryEmail}" is not authorised.\n` +
            "Please contact the organisers to add this email to the allowed list."
          );
        } else {
          alert(`❌ Scoring failed: ${err.message || "Unknown error"}`);
        }
      }
    } catch (err) {
      console.error("Failed to score project:", err);
      alert("Network error – please try again.");
    }
  };

  return (
    <JuryPortal
      paginatedTeams={paginatedTeams}
      pagination={pagination}
      isLoading={isLoadingPaginated}
      onFetchData={handleFetchData}
      onRefreshData={handleRefresh}
      onScoreProject={handleScoreProject}
    />
  );
}