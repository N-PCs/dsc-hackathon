"use client";

import React, { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";
import { Announcement } from "@/types";

interface LiveAnnouncementsBannerProps {
  announcements: Announcement[];
  onDismiss?: () => void;
}

export const LiveAnnouncementsBanner: React.FC<LiveAnnouncementsBannerProps> = ({
  announcements,
  onDismiss,
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (announcements.length > 0) {
      setDismissed(false);
    }
  }, [announcements.length, announcements[0]?.id]);

  if (announcements.length === 0 || dismissed) return null;

  const latest = announcements[0];

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white text-[13px] px-6 h-10 flex items-center shadow-lg border-b border-orange-500/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <span
            className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 text-orange-200 border border-orange-400/30"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <Megaphone className="w-3 h-3 text-orange-300 animate-pulse" />
            ANNOUNCEMENT
          </span>
          <span className="w-px h-4 bg-white/30 shrink-0" />
          <span className="truncate font-medium text-xs md:text-sm">
            <span className="font-bold text-white">{latest.title}</span>
            <span className="hidden sm:inline text-white/90"> — {latest.message}</span>
          </span>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/70 hover:text-white p-1 hover:bg-black/20 rounded transition-colors cursor-pointer shrink-0"
          title="Dismiss Announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};