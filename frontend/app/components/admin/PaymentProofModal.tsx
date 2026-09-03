"use client";

import React from "react";
import { Team, PaymentStatus } from "@/types";

interface PaymentProofModalProps {
  team: Team;
  onClose: () => void;
  onUpdateTeamStatus: (
    teamId: string,
    status: { paymentStatus?: PaymentStatus; checkedInVenue?: boolean; ticketIssued?: boolean; notes?: string }
  ) => void;
}

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({ team, onClose, onUpdateTeamStatus }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-neutral-800 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h4 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Payment Screenshot & UTR
            </h4>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {team.teamName} ({team.id})
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase">
            ✕ Close
          </button>
        </div>
        <div className="bg-black p-3 text-xs font-mono space-y-1 border border-neutral-800">
          <div>
            Transaction Ref: <span className="text-orange-400 font-bold">{team.transactionRef}</span>
          </div>
          <div>
            Leader: {team.leader.name} ({team.leader.phone})
          </div>
        </div>
        {team.paymentProofUrl ? (
          <div className="max-h-72 overflow-auto border border-neutral-800 flex justify-center bg-black p-2">
            <img src={team.paymentProofUrl} alt="Payment Proof" className="max-h-64 object-contain" />
          </div>
        ) : (
          <div className="py-8 text-center text-neutral-500 text-xs font-mono">No screenshot file was uploaded. Verified via direct UTR ref.</div>
        )}
        <div className="flex items-center justify-end gap-3 pt-2 font-mono">
          <button
            onClick={() => {
              onUpdateTeamStatus(team.id, { paymentStatus: "rejected" });
              onClose();
            }}
            className="px-4 py-2 bg-black border border-neutral-800 hover:bg-rose-950 text-rose-400 text-xs font-bold uppercase cursor-pointer"
          >
            Reject Proof
          </button>
          <button
            onClick={() => {
              onUpdateTeamStatus(team.id, { paymentStatus: "verified", ticketIssued: true });
              onClose();
            }}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white border border-orange-500 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Approve & Issue ID Badge
          </button>
        </div>
      </div>
    </div>
  );
};