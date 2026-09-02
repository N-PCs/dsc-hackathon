"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  FileText,
  Send,
  Download,
  LogOut,
  CheckCircle,
  Clock,
  Sparkles,
  Users,
  Printer,
} from "lucide-react";
import { Team } from "@/types";
import { ProjectSubmissionModal } from "./ProjectSubmissionModal";
import { useRouter } from "next/navigation";

interface TeamPassTicketProps {
  team: Team | null;
  onNavigateToSubmit?: () => void;
  onSwitchTeamLogin?: () => void;
  onSwitchToTeamLogin?: () => void;
  onRefreshTeamData?: () => void;
}

export const TeamPassTicket: React.FC<TeamPassTicketProps> = ({
  team,
  onNavigateToSubmit,
  onSwitchTeamLogin,
  onSwitchToTeamLogin,
}) => {
  const router = useRouter();
  const handleLoginClick = onSwitchTeamLogin || onSwitchToTeamLogin || (() => router.push("/team"));
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"pass" | "members" | "submission">("pass");

  if (!team) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <UserCheck className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
            WORKSPACE ACCESS REQUIRED
          </span>
          <h2
            className="text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Team Workspace & Pass
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed font-mono">
            Sign in with your Team ID (e.g. ORIGIN-101) or Leader Email to view your venue Digital Pass, team roster, and project submission hub.
          </p>
          <div className="pt-2">
            <button
              onClick={handleLoginClick}
              className="px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold border border-orange-500 flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer"
            >
              <span>Sign In to Team Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = team.paymentStatus === "verified";
  const members = [
    { role: "Team Leader", ...team.leader },
    team.member2?.name ? { role: "Member 2", ...team.member2 } : null,
    team.member3?.name ? { role: "Member 3", ...team.member3 } : null,
    team.member4?.name ? { role: "Member 4", ...team.member4 } : null,
    team.member5?.name ? { role: "Member 5", ...team.member5 } : null,
  ].filter(Boolean) as Array<{
    role: string;
    name: string;
    email: string;
    phone?: string;
    registrationNumber?: string;
    residentialStatus?: "Hosteller" | "Day Scholar";
    messName?: string;
  }>;

  const handlePrintPass = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-8">
      <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                TEAM WORKSPACE
              </span>
              <span className="text-xs font-mono text-neutral-500">ID: {team.id}</span>
              {isVerified ? (
                <span className="px-2.5 py-0.5 bg-orange-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-orange-500">
                  <ShieldCheck className="w-3 h-3" /> VERIFIED PASS ISSUED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> PENDING ADMIN VERIFICATION
                </span>
              )}
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {team.teamName}
            </h1>
            <p className="text-xs text-neutral-400 font-mono mt-1">
              Track: <span className="text-orange-400 font-semibold">{team.track}</span> • Registered: {team.registeredAt}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleLoginClick}
              className="px-3.5 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Team</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-0 overflow-x-auto">
          <button
            onClick={() => setActiveWorkspaceTab("pass")}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeWorkspaceTab === "pass"
                ? "border-orange-500 text-orange-500 bg-orange-500/5"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Digital ID Ticket</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab("members")}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeWorkspaceTab === "members"
                ? "border-orange-500 text-orange-500 bg-orange-500/5"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveWorkspaceTab("submission")}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeWorkspaceTab === "submission"
                ? "border-orange-500 text-orange-500 bg-orange-500/5"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Project Submission</span>
          </button>
        </div>

        {/* Tab content */}
        {activeWorkspaceTab === "pass" && (
          <div className="space-y-6 pt-2">
            {!isVerified && (
              <div className="p-4 bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs font-mono flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold block uppercase">Pass Locked — Verification Pending</span>
                  <span className="text-neutral-400 text-[11px]">
                    Your registration payment (UTR: {team.transactionRef || "N/A"}) is currently being audited. The pass and project submission portal will automatically activate once confirmed.
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handlePrintPass}
                className="px-4 py-2 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors print:hidden"
              >
                <Download className="w-3.5 h-3.5 text-orange-500" />
                <span>Print / Save Pass (PDF)</span>
              </button>
            </div>

            {/* Digital Pass Card */}
            <div className="border border-neutral-700 bg-black text-white shadow-2xl relative print:border print:shadow-none">
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950 print:bg-black">
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg font-bold text-white tracking-wider"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    ORIGIN '26
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span className="text-[11px] font-mono text-neutral-400">18H HACKATHON · 4-5 SEP</span>
                </div>
                <span className={`text-xs font-mono font-bold uppercase ${isVerified ? "text-orange-500" : "text-amber-400"}`}>
                  {isVerified ? "Verified Entry Approved ✓" : "Verification Pending"}
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                      TEAM NAME
                    </span>
                    <h3
                      className="text-3xl font-bold text-white tracking-tight"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {team.teamName}
                    </h3>
                    <span className="text-xs font-mono text-neutral-400 mt-1 block">
                      Team ID: <span className="text-white font-semibold">{team.id}</span>
                    </span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-neutral-500 uppercase block">TRACK</span>
                    <span className="text-xs font-bold text-orange-400">{team.track}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">LEADER NAME</span>
                    <span className="text-white font-semibold">{team.leader.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">PAYMENT UTR</span>
                    <span className="text-neutral-300">{team.transactionRef || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">LEADER CONTACT</span>
                    <span className="text-neutral-300">{team.leader.phone || team.leader.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">REGISTRATION FEE</span>
                    <span className="text-orange-400 font-bold">₹{team.amountPaid || 150} PAID</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2">
                    CONFIRMED TEAM MEMBERS ({members.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {members.map((m, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] font-mono px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-200 flex items-center gap-1.5"
                      >
                        <span className="text-orange-500 font-bold">{idx === 0 ? "★ Leader:" : `M${idx + 1}:`}</span>
                        <span>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 text-xs font-mono text-neutral-400 bg-neutral-950 print:bg-black">
                <span>VENUE: AB02 Auditorium 1 & 2 · VIT Bhopal University</span>
                <span className={team.checkedInVenue ? "text-orange-500 font-bold" : "text-neutral-500"}>
                  {team.checkedInVenue ? "VENUE CHECK-IN COMPLETE ✓" : "AWAITING DESK CHECK-IN"}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeWorkspaceTab === "members" && (
          <div className="space-y-6 pt-2 font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((m, idx) => (
                <div key={idx} className="bg-black border border-neutral-800 p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-bold uppercase">
                        {m.role}
                      </span>
                      <span className="text-white font-bold text-sm">{m.name}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Mail className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{m.email}</span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{m.phone}</span>
                      </div>
                    )}
                    {m.registrationNumber && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <FileText className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Reg No: {m.registrationNumber}</span>
                      </div>
                    )}
                    {m.residentialStatus && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="capitalize">
                          {m.residentialStatus === "Hosteller"
                            ? `Hosteller (Mess: ${m.messName || "N/A"})`
                            : "Day Scholar"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black border border-neutral-800 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Financial & Payment Record
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-400 pt-2">
                <div>
                  <span className="block text-[10px] text-neutral-500 uppercase">Payment Status</span>
                  <span className={`font-bold ${isVerified ? "text-orange-500" : "text-amber-400"}`}>
                    {team.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-500 uppercase">UTR / Reference</span>
                  <span className="text-white">{team.transactionRef || "N/A"}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-neutral-500 uppercase">Amount Deposited</span>
                  <span className="text-orange-400 font-bold">₹{team.amountPaid || 150}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeWorkspaceTab === "submission" && (
          <div className="pt-2">
            <ProjectSubmissionModal
              team={team}
              onProjectSubmitted={(updatedTeam) => {
                if (onNavigateToSubmit) onNavigateToSubmit();
              }}
              onSwitchToTeamLogin={handleLoginClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};