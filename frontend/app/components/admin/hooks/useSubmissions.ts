"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AdminUser, Team } from "@/types";

const SUBMISSIONS_STALE_MS = 30000; // 30 seconds

export function useSubmissions(currentAdmin: AdminUser | null, adminTab: string) {
  const [allSubmissions, setAllSubmissions] = useState<Team[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const lastSubmissionsFetch = useRef<number>(0);
  const isLoadingRef = useRef(false);

  const fetchAllSubmissions = useCallback(
    async (force = false) => {
      if (!currentAdmin) return;

      const now = Date.now();
      // Skip if data is fresh and not forced
      if (!force && allSubmissions.length > 0 && now - lastSubmissionsFetch.current < SUBMISSIONS_STALE_MS) {
        return;
      }

      // Prevent concurrent fetches
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoadingSubmissions(true);
      setSubmissionsError(null);

      try {
        const query = new URLSearchParams({
          page: "1",
          limit: "1000",
          search: "",
          status: "all",
          track: "all",
          hasProject: "true",
        }).toString();
        const res = await fetch(`/api/teams?${query}`, {
          headers: { "x-admin-email": currentAdmin.email },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.teams)) {
          setAllSubmissions(data.teams);
          lastSubmissionsFetch.current = now;
          setSubmissionsError(null);
        } else {
          throw new Error(data.message || "Invalid response");
        }
      } catch (err: any) {
        console.error("Failed to fetch submissions:", err);
        setSubmissionsError(err.message || "Failed to load submissions.");
        // If we already have data, keep it; otherwise, leave array empty.
      } finally {
        setIsLoadingSubmissions(false);
        isLoadingRef.current = false;
      }
    },
    [currentAdmin, allSubmissions.length]
  );

  // Initial fetch when admin logs in
  useEffect(() => {
    if (currentAdmin) {
      fetchAllSubmissions();
    }
  }, [currentAdmin, fetchAllSubmissions]);

  // Re-fetch when switching to submissions/leaderboard tabs, but only if stale
  useEffect(() => {
    if (currentAdmin && (adminTab === "submissions" || adminTab === "leaderboard")) {
      fetchAllSubmissions();
    }
  }, [adminTab, currentAdmin, fetchAllSubmissions]);

  return { allSubmissions, isLoadingSubmissions, submissionsError, fetchAllSubmissions };
}