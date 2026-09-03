"use client";

import React from "react";
import { Search, Eye, Trash2, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Team, PaymentStatus } from "@/types";
import { calcTeamFee } from "./utils";

interface TeamsTabProps {
  paginatedTeams: Team[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  isLoading: boolean;
  search: string;
  setSearch: (val: string) => void;
  statusFilter: "all" | "pending" | "verified" | "rejected";
  setStatusFilter: (val: "all" | "pending" | "verified" | "rejected") => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onUpdateTeamStatus: (
    teamId: string,
    status: { paymentStatus?: PaymentStatus; checkedInVenue?: boolean; ticketIssued?: boolean; notes?: string }
  ) => void;
  onDeleteTeam: (teamId: string) => void;
  onViewProof: (team: Team) => void;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({
  paginatedTeams,
  pagination,
  isLoading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onUpdateTeamStatus,
  onDeleteTeam,
  onViewProof,
}) => {
  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black p-4 border border-neutral-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search Team ID, Team Name, Leader Name, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-neutral-800 pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono placeholder:text-neutral-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black border border-neutral-800 px-3 py-2 text-xs text-white font-mono focus:border-orange-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Only</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-black border border-neutral-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-900 text-neutral-500 font-mono uppercase text-[11px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="p-3.5">Team & ID</th>
              <th className="p-3.5">Leader Details</th>
              <th className="p-3.5">Payment</th>
              <th className="p-3.5">Check-In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono">
                  Loading teams...
                </td>
              </tr>
            ) : paginatedTeams.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-500 font-mono">
                  No teams match the filter criteria.
                </td>
              </tr>
            ) : (
              paginatedTeams.map((team) => (
                <tr key={team.id} className="hover:bg-neutral-950 transition-colors text-neutral-300">
                  <td className="p-3.5">
                    <div className="font-bold text-white">{team.teamName}</div>
                    <div className="font-mono text-[10px] text-orange-500">{team.id}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-white font-medium flex items-center gap-1.5 flex-wrap">
                      <span>{team.leader.name}</span>
                      {team.leader.registrationNumber && (
                        <span className="text-[9px] text-orange-400 font-mono font-normal bg-orange-500/10 px-1 py-0.2 border border-orange-500/20">
                          {team.leader.registrationNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">{team.leader.email}</div>
                    <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1 flex-wrap mt-0.5">
                      <span>{team.leader.phone}</span>
                      {team.leader.residentialStatus && (
                        <span className="text-[9px] text-neutral-400 border border-neutral-800 px-1 py-0.2 uppercase">
                          {team.leader.residentialStatus}
                        </span>
                      )}
                      {team.leader.messName && (
                        <span className="text-[9px] text-amber-400/90 border border-amber-500/20 px-1 py-0.2">
                          {team.leader.messName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-xs font-mono flex items-center gap-2">
                      {team.paymentStatus === "verified" ? (
                        <span className="text-emerald-400">Verified</span>
                      ) : team.paymentStatus === "pending" ? (
                        <span className="text-amber-400">Pending</span>
                      ) : (
                        <span className="text-rose-400">Rejected</span>
                      )}
                      {team.paymentProofUrl && (
                        <button
                          onClick={() => onViewProof(team)}
                          className="text-neutral-500 hover:text-orange-400 transition-colors cursor-pointer"
                          title="View payment proof"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="font-bold text-white font-mono mt-1 text-xs">
                      <span className="text-orange-400">₹{calcTeamFee(team)}</span>
                      <span className="text-[9px] text-neutral-500 uppercase ml-1 font-normal">paid</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {team.paymentStatus !== "verified" && (
                        <button
                          onClick={() => onUpdateTeamStatus(team.id, { paymentStatus: "verified", ticketIssued: true })}
                          className="text-[9px] font-mono px-1.5 py-0.5 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-950/40 cursor-pointer uppercase"
                        >
                          Verify
                        </button>
                      )}
                      {team.paymentStatus !== "rejected" && (
                        <button
                          onClick={() => onUpdateTeamStatus(team.id, { paymentStatus: "rejected" })}
                          className="text-[9px] font-mono px-1.5 py-0.5 border border-rose-800/60 text-rose-400 hover:bg-rose-950/40 cursor-pointer uppercase"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Delete team "${team.teamName}"? This cannot be undone.`)) {
                            onDeleteTeam(team.id);
                          }
                        }}
                        className="text-[9px] font-mono px-1.5 py-0.5 border border-neutral-700 text-neutral-400 hover:text-rose-400 hover:border-rose-800/60 cursor-pointer uppercase ml-auto"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={team.checkedInVenue}
                        onChange={(e) =>
                          onUpdateTeamStatus(team.id, {
                            checkedInVenue: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      <span className={`ml-2 text-xs font-mono font-bold ${team.checkedInVenue ? "text-green-400" : "text-neutral-500"}`}>
                        {team.checkedInVenue ? "PRESENT" : "ABSENT"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black border border-neutral-800 p-4">
        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={onPageSizeChange}
            className="bg-black border border-neutral-800 px-2 py-1 text-white focus:outline-none"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>
            {pagination.total === 0
              ? "0 items"
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, pagination.total)} of ${pagination.total}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum: number;
            if (pagination.totalPages <= 5) pageNum = i + 1;
            else if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;
            if (pageNum < 1 || pageNum > pagination.totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1.5 border ${
                  currentPage === pageNum
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};