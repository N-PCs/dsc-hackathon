import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Announcement } from '../types';

interface LiveAnnouncementsBannerProps {
  announcements: Announcement[];
}

export const LiveAnnouncementsBanner: React.FC<LiveAnnouncementsBannerProps> = ({
  announcements,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (announcements.length === 0 || dismissed) return null;

  const latest = announcements[0];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FF5F00] text-black text-[13px] px-6 py-2.5 border-b-3 border-black font-bold uppercase tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <span
            className="text-[12px] font-extrabold tracking-wider shrink-0 bg-black text-[#FFC599] px-2 py-0.5 border border-[#FF5F00]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Live
          </span>
          <span className="w-0.5 h-4 bg-black/40 shrink-0" />
          <span className="truncate font-bold font-mono">
            <span>{latest.title}</span>
            <span className="hidden sm:inline opacity-80"> — {latest.message}</span>
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-black hover:text-[#000]/70 p-0.5 cursor-pointer shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
