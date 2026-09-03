"use client";

import React from "react";
import { Users, Layers, Award, Radio, ShieldCheck } from "lucide-react";

export type AdminTab = "teams" | "submissions" | "leaderboard" | "broadcast" | "access";

interface AdminTabsNavProps {
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  teamsTotal: number;
  submissionsCount: number;
  whitelistCount: number;
}

export const AdminTabsNav: React.FC<AdminTabsNavProps> = ({
  adminTab,
  setAdminTab,
  teamsTotal,
  submissionsCount,
  whitelistCount,
}) => {
  const tabButtonClass = (tab: AdminTab) =>
    `px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold cursor-pointer transition-colors border ${
      adminTab === tab
        ? "bg-orange-600 text-white border-orange-500"
        : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
    }`;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-800">
      <button onClick={() => setAdminTab("teams")} className={tabButtonClass("teams")}>
        <Users className="w-4 h-4 inline mr-1.5" />
        <span>Teams ({teamsTotal})</span>
      </button>

      <button onClick={() => setAdminTab("submissions")} className={tabButtonClass("submissions")}>
        <Layers className="w-4 h-4 inline mr-1.5" />
        <span>24H Submissions ({submissionsCount})</span>
      </button>

      <button onClick={() => setAdminTab("leaderboard")} className={tabButtonClass("leaderboard")}>
        <Award className="w-4 h-4 inline mr-1.5" />
        <span>Jury Leaderboard</span>
      </button>

      <button onClick={() => setAdminTab("broadcast")} className={tabButtonClass("broadcast")}>
        <Radio className="w-4 h-4 inline mr-1.5" />
        <span>Live Broadcasts</span>
      </button>

      <button onClick={() => setAdminTab("access")} className={tabButtonClass("access")}>
        <ShieldCheck className="w-4 h-4 inline mr-1.5" />
        <span>Admin Whitelist ({whitelistCount})</span>
      </button>
    </div>
  );
};