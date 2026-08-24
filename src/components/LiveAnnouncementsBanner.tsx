import React, { useState } from 'react';
import { Radio, X } from 'lucide-react';
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
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2.5 text-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold shrink-0 border border-blue-500/30">
            <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>LIVE BROADCAST</span>
          </div>

          <div className="truncate font-medium flex items-center gap-2">
            <span className="text-white font-bold">{latest.title}:</span>
            <span className="text-slate-300 truncate hidden sm:inline">{latest.message}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded hover:bg-blue-500/10 transition-colors cursor-pointer"
          >
            {isExpanded ? 'Hide All' : `View All (${announcements.length})`}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-0.5 text-xs cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded announcements drawer */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-blue-400 font-bold uppercase">{ann.category}</span>
                <span className="text-slate-400">{ann.timestamp}</span>
              </div>
              <div className="font-bold text-white text-xs">{ann.title}</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{ann.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
