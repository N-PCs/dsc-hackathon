import React from 'react';
import { motion } from 'motion/react';
import {
  Ticket,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Clock,
  Lock,
} from 'lucide-react';
import { Team } from '../types';

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
  const handleLoginClick = onSwitchTeamLogin || onSwitchToTeamLogin;

  if (!team) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center text-blue-600 mb-4 shadow-sm">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Team Authentication Required</h3>
        <p className="text-sm text-slate-600 mb-6">
          Please sign in with your Team ID or Leader Email to view your Digital Pass and verification status.
        </p>
        <button
          onClick={handleLoginClick}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 cursor-pointer transition-all"
        >
          Sign In to Team Workspace
        </button>
      </div>
    );
  }

  const isVerified = team.paymentStatus === 'verified';

  // Render Locked Pass view if admin verification is pending
  if (!isVerified) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold mb-3">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>STATUS: PENDING ADMIN VERIFICATION</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Team Pass Pending Verification
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            Registered Team: <span className="text-slate-900 font-bold">{team.teamName}</span> ({team.id})
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-10 h-10 mb-1" />
              <span className="text-[10px] font-mono font-bold">LOCKED</span>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Payment Verification in Progress
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your registration data is saved and your payment receipt was submitted. Authorized DSC Administrators are verifying your transaction ref (<span className="text-blue-600 font-mono font-bold">{team.transactionRef}</span>).
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  Track: {team.track}
                </span>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700">
                  Access Code: {team.accessCode}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Registered: {team.registeredAt}</span>
            <span className="text-amber-700 flex items-center gap-1 font-sans font-semibold">
              <Clock className="w-3.5 h-3.5" /> Pass unlocks after Admin approval
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Official Verified Team Pass
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>VERIFIED TEAM PASS • ORIGIN '26 VERIFIED</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900">
          Digital ID Pass & Hackathon Ticket
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Present this pass at venue check-in desk for entry badges and swag kits.
        </p>
      </div>

      {/* Main Ticket Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50/50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-sm">
              OG
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-base">ORIGIN '26</span>
              <span className="text-[10px] text-blue-600 block font-mono font-bold">
                DATA SCIENCE CLUB • 24H SPRINT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" /> VERIFIED PASS
            </span>
          </div>
        </div>

        {/* Pass Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                TEAM NAME & ID
              </span>
              <h3 className="text-2xl font-serif font-extrabold text-slate-900">
                {team.teamName}
              </h3>
              <span className="text-xs font-mono text-blue-600 font-bold">
                {team.id} • Access PIN: {team.accessCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  TRACK
                </span>
                <span className="text-xs text-slate-900 font-bold">{team.track}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">
                  LEADER
                </span>
                <span className="text-xs text-slate-900 font-bold">{team.leader.name}</span>
              </div>
            </div>

            {/* Teammates chips */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">
                TEAM MEMBERS ({1 + (team.member2 ? 1 : 0) + (team.member3 ? 1 : 0) + (team.member4 ? 1 : 0)})
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded bg-blue-50 text-[11px] text-blue-800 border border-blue-200 font-mono font-bold">
                  ★ {team.leader.name} (Lead)
                </span>
                {team.member2?.name && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-[11px] text-slate-800 border border-slate-200 font-mono">
                    {team.member2.name}
                  </span>
                )}
                {team.member3?.name && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-[11px] text-slate-800 border border-slate-200 font-mono">
                    {team.member3.name}
                  </span>
                )}
                {team.member4?.name && (
                  <span className="px-2.5 py-1 rounded bg-slate-100 text-[11px] text-slate-800 border border-slate-200 font-mono">
                    {team.member4.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-blue-600 shadow-md">
            <QrCode className="w-28 h-28 text-slate-900" />
            <span className="text-[10px] font-mono font-bold text-slate-900 mt-2">
              VERIFIED ENTRY PASS
            </span>
            <span className="text-[9px] font-mono text-slate-600">{team.id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 font-mono">
          <span>Venue: Auditorium AB02 • VIT Bhopal</span>
          <span className="font-bold text-blue-600">Check-in: {team.checkedInVenue ? 'Checked In ✓' : 'Awaiting Check-in'}</span>
        </div>
      </motion.div>
    </div>
  );
};
