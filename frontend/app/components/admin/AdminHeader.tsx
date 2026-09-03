"use client";

import React from "react";
import { Lock, RefreshCw, FileSpreadsheet, FileText, LogOut, UserCheck } from "lucide-react";
import { AdminUser } from "@/types";

interface AdminHeaderProps {
  currentAdmin: AdminUser;
  isDeadlinePassed: boolean;
  isRegistrationsOpen: boolean;
  isSubmissionsOpen: boolean;
  isTogglingRegistrations: boolean;
  isTogglingSubmissions: boolean;
  onToggleRegistrations: () => void;
  onToggleSubmissions: () => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onSignOut: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentAdmin,
  isDeadlinePassed,
  isRegistrationsOpen,
  isSubmissionsOpen,
  isTogglingRegistrations,
  isTogglingSubmissions,
  onToggleRegistrations,
  onToggleSubmissions,
  onRefresh,
  onExportExcel,
  onExportCsv,
  onSignOut,
}) => {
  return (
    <div className="bg-black border border-neutral-800 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider">
            OPERATIONS COMMAND CONSOLE
          </span>
          <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-400 text-[10px] font-mono font-bold border border-orange-500/30 uppercase tracking-wider">
            {currentAdmin.role.toUpperCase()}
          </span>
          <span className="px-2.5 py-0.5 bg-black text-neutral-400 text-[10px] font-mono border border-neutral-800 hidden sm:inline uppercase">
            {currentAdmin.department || "Data Science Club"}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2" style={{ fontFamily: "var(--font-heading)" }}>
          Origin Overnight Command Hub
        </h2>
        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1 font-mono">
          <span className="text-orange-400 flex items-center gap-1 font-semibold">
            <UserCheck className="w-3.5 h-3.5" /> {currentAdmin.name}
          </span>
          <span>•</span>
          <span className="text-neutral-300">{currentAdmin.email}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isDeadlinePassed && (
          <span className="px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono text-xs font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Deadline Passed (Backend Locked)</span>
          </span>
        )}

        {/* Registration Toggle */}
        <div className="flex items-center gap-2 bg-black px-3 py-2 border border-neutral-800">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Registrations</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isRegistrationsOpen}
              onChange={onToggleRegistrations}
              disabled={isTogglingRegistrations}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
          <span className={`text-[11px] font-mono font-bold ${isRegistrationsOpen ? "text-green-400" : "text-red-400"}`}>
            {isRegistrationsOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>

        {/* Submissions Toggle */}
        <div className="flex items-center gap-2 bg-black px-3 py-2 border border-neutral-800">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Submissions</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSubmissionsOpen}
              onChange={onToggleSubmissions}
              disabled={isTogglingSubmissions}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
          <span className={`text-[11px] font-mono font-bold ${isSubmissionsOpen ? "text-green-400" : "text-red-400"}`}>
            {isSubmissionsOpen ? "OPEN" : "CLOSED"}
          </span>
        </div>

        <button
          id="admin-btn-refresh"
          onClick={onRefresh}
          className="px-3.5 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          title="Refresh all data"
        >
          <RefreshCw className="w-4 h-4 text-orange-500" />
        </button>

        <button
          id="admin-btn-export-excel"
          onClick={onExportExcel}
          className="px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-orange-500" />
          <span>Export Excel</span>
        </button>

        <button
          id="admin-btn-export-csv"
          onClick={onExportCsv}
          className="px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-orange-500" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onSignOut}
          className="px-3.5 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-rose-400 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Sign out from this admin session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};