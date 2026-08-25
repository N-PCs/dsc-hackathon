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
    <div className="fixed top-0 left-0 right-0 z-[60] bg-orange-600 text-white text-[13px] px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <span
            className="text-[11px] font-bold uppercase tracking-wider shrink-0"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Live
          </span>
          <span className="w-px h-4 bg-white/30 shrink-0" />
          <span className="truncate font-medium">
            <span className="font-bold">{latest.title}</span>
            <span className="hidden sm:inline text-white/80"> — {latest.message}</span>
          </span>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-white/60 hover:text-white p-0.5 cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
