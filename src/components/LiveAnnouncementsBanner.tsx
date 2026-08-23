import React, { useState } from 'react';
import { Radio, Bell, X, ChevronRight, Sparkles, AlertTriangle, Coffee, Users } from 'lucide-react';
import { Announcement } from '../types';

interface LiveAnnouncementsBannerProps {
  announcements: Announcement[];
}

export const LiveAnnouncementsBanner: React.FC<LiveAnnouncementsBannerProps> = ({
  announcements,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (announcements.length === 0 || dismissed) return null;

  const latest = announcements[0];

  return (
    <div className="bg-[#0c0c0e] border-b border-white/10 text-xs px-4 py-2.5 text-zinc-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold shrink-0 border border-emerald-500/20">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LIVE BROADCAST</span>
          </div>

          <div className="truncate font-medium flex items-center gap-2">
            <span className="text-white font-bold">{latest.title}:</span>
            <span className="text-zinc-400 truncate hidden sm:inline">{latest.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            {isExpanded ? 'Hide All' : `View All (${announcements.length})`}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-400 hover:text-white p-0.5 text-xs cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded announcements drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 bg-[#111114] border border-white/10 rounded-xl space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-bold uppercase">{ann.category}</span>
                <span className="text-zinc-500">{ann.timestamp}</span>
              </div>
              <div className="font-bold text-white text-xs">{ann.title}</div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">{ann.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
