"use client";

import React from "react";
import { CalendarCheck } from "lucide-react";

interface AdminStatsGridProps {
  totalTeamsCount: number;
  checkedInCount: number;
  submissionsCount: number;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  totalTeamsCount,
  checkedInCount,
  submissionsCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
      <div className="bg-black p-5">
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Total Teams</span>
        <div className="text-3xl font-extrabold text-white font-mono">{totalTeamsCount}</div>
      </div>
      <div className="bg-black p-5">
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
          <CalendarCheck className="w-3 h-3" /> Checked-in Teams
        </span>
        <div className="text-3xl font-extrabold text-orange-500 font-mono">{checkedInCount}</div>
      </div>
      <div className="bg-black p-5">
        <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Submissions</span>
        <div className="text-3xl font-extrabold text-orange-400 font-mono">{submissionsCount}</div>
      </div>
    </div>
  );
};