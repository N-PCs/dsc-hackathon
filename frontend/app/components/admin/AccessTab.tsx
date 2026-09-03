"use client";

import React from "react";
import { ShieldCheck, UserPlus, CheckCircle, Trash2, Plus } from "lucide-react";
import { AdminUser } from "@/types";

interface AccessTabProps {
  adminWhitelist: AdminUser[];
  currentAdmin: AdminUser;
  newAdminEmail: string;
  setNewAdminEmail: (val: string) => void;
  newAdminName: string;
  setNewAdminName: (val: string) => void;
  newAdminRole: "Superadmin" | "Lead Organizer" | "Jury Chair" | "Operations Lead" | "Faculty Advisor";
  setNewAdminRole: (val: "Superadmin" | "Lead Organizer" | "Jury Chair" | "Operations Lead" | "Faculty Advisor") => void;
  newAdminDept: string;
  setNewAdminDept: (val: string) => void;
  addAdminSuccess: string;
  onAddAdmin: (e: React.FormEvent) => void;
  onRemoveAdmin: (email: string) => void;
}

export const AccessTab: React.FC<AccessTabProps> = ({
  adminWhitelist,
  currentAdmin,
  newAdminEmail,
  setNewAdminEmail,
  newAdminName,
  setNewAdminName,
  newAdminRole,
  setNewAdminRole,
  newAdminDept,
  setNewAdminDept,
  addAdminSuccess,
  onAddAdmin,
  onRemoveAdmin,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              <span>Authorized Email Whitelist</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1 font-mono">Only email addresses listed here can access the Admin Console and Jury Evaluation sheets.</p>
          </div>
          <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 border border-orange-500/30 uppercase tracking-wider">
            {adminWhitelist.length} Admins
          </span>
        </div>

        <div className="space-y-3 font-mono">
          {adminWhitelist.map((admin) => {
            const isSelf = currentAdmin.email.toLowerCase() === admin.email.toLowerCase();
            return (
              <div key={admin.email} className="p-4 bg-black border border-neutral-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 bg-black border border-neutral-800 flex items-center justify-center text-orange-500 font-mono text-sm font-bold shrink-0">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{admin.name}</span>
                      {isSelf && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-orange-500/10 text-orange-400 font-mono font-bold border border-orange-500/30">YOU</span>
                      )}
                      <span className="text-[10px] px-2 py-0.2 bg-black text-neutral-400 font-mono border border-neutral-800 uppercase">{admin.role}</span>
                    </div>
                    <div className="text-xs font-mono text-neutral-400 truncate">{admin.email}</div>
                    <div className="text-[10px] text-neutral-500">{admin.department || "Data Science Club"}</div>
                  </div>
                </div>
                {!isSelf && (
                  <button
                    onClick={() => onRemoveAdmin(admin.email)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Revoke Admin Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-5 bg-black border border-neutral-800 p-6 sm:p-8 space-y-5 font-mono">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <UserPlus className="w-5 h-5 text-orange-500" />
            <span>Authorize New Email</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Grant executive council or jury evaluation privileges to an official email.</p>
        </div>

        {addAdminSuccess && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4" />
            <span>{addAdminSuccess}</span>
          </div>
        )}

        <form onSubmit={onAddAdmin} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Official Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. mentor.ai@vitbhopal.ac.in"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Prof. Priya Sharma"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Administrative Role</label>
            <select
              value={newAdminRole}
              onChange={(e) => setNewAdminRole(e.target.value as any)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
            >
              <option value="Lead Organizer">Lead Organizer (DSC Core)</option>
              <option value="Jury Chair">Jury Member / Evaluator</option>
              <option value="Operations Lead">Operations & Check-In Lead</option>
              <option value="Faculty Advisor">Faculty Coordinator</option>
              <option value="Superadmin">Superadmin</option>
            </select>
          </div>
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Department / Organization</label>
            <input
              type="text"
              placeholder="e.g. Data Science Club or Dept of AI"
              value={newAdminDept}
              onChange={(e) => setNewAdminDept(e.target.value)}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold font-mono text-xs uppercase tracking-wider border border-orange-500 flex items-center justify-center gap-2 transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Add Email to Authorized Whitelist</span>
          </button>
        </form>
      </div>
    </div>
  );
};