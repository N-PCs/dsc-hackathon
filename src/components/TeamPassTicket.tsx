import React from 'react';
import {
  Ticket,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Clock,
  Lock,
  Download,
  AlertCircle,
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
        <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-white/10 mx-auto flex items-center justify-center text-emerald-400 mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-2">Team Authentication Required</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Please sign in with your Team ID or Leader Email to view your Digital Pass and status.
        </p>
        <button
          onClick={handleLoginClick}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-md cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>STATUS: PENDING ADMIN VERIFICATION</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">
            Team Pass Pending Verification
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Registered Team: <span className="text-white font-bold">{team.teamName}</span> ({team.id})
          </p>
        </div>

        <div className="relative bg-[#111114] border border-amber-500/30 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-10 h-10 mb-1" />
              <span className="text-[10px] font-mono font-bold">LOCKED</span>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-serif font-bold text-white">
                Payment Verification in Progress
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your registration data has been saved to Neon DB and your payment receipt screenshot was securely stored in Imagekit. Authorized DSC Administrators are verifying your transaction ref (<span className="text-emerald-400 font-mono">{team.transactionRef}</span>).
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#18181b] border border-white/10 text-zinc-300">
                  Track: {team.track}
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#18181b] border border-white/10 text-zinc-300">
                  Access Code: {team.accessCode}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
            <span>Registered: {team.registeredAt}</span>
            <span className="text-amber-400 flex items-center gap-1 font-sans font-semibold">
              <Clock className="w-3.5 h-3.5" /> Pass unlocks after Admin approval
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render Official Verified Team Pass
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIED TEAM PASS • ORIGIN '26 VERIFIED</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-white">
          Digital ID Pass & Hackathon Ticket
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Present this pass at venue check-in desk for entry badges and swag kits.
        </p>
      </div>

      {/* Main Ticket Card */}
      <div className="relative bg-gradient-to-br from-[#121216] via-[#16161c] to-[#0d0d11] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-extrabold text-sm">
              OG
            </div>
            <div>
              <span className="font-extrabold text-white text-base">ORIGIN '26</span>
              <span className="text-[10px] text-emerald-400 block font-mono">
                DATA SCIENCE CLUB • 24H SPRINT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> VERIFIED PASS
            </span>
          </div>
        </div>

        {/* Pass Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="sm:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                TEAM NAME & ID
              </span>
              <h3 className="text-2xl font-serif font-extrabold text-white">
                {team.teamName}
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {team.id} • Access PIN: {team.accessCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  TRACK
                </span>
                <span className="text-xs text-white font-semibold">{team.track}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  LEADER
                </span>
                <span className="text-xs text-white font-semibold">{team.leader.name}</span>
              </div>
            </div>

            {/* Teammates chips */}
            <div className="pt-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1.5">
                TEAM MEMBERS ({1 + (team.member2 ? 1 : 0) + (team.member3 ? 1 : 0) + (team.member4 ? 1 : 0)})
              </span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-emerald-300 border border-white/10 font-mono">
                  ★ {team.leader.name} (Lead)
                </span>
                {team.member2?.name && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-zinc-300 border border-white/10 font-mono">
                    {team.member2.name}
                  </span>
                )}
                {team.member3?.name && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-zinc-300 border border-white/10 font-mono">
                    {team.member3.name}
                  </span>
                )}
                {team.member4?.name && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-zinc-300 border border-white/10 font-mono">
                    {team.member4.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-xl">
            <QrCode className="w-28 h-28 text-zinc-950" />
            <span className="text-[10px] font-mono font-bold text-zinc-900 mt-2">
              VERIFIED ENTRY PASS
            </span>
            <span className="text-[9px] font-mono text-zinc-600">{team.id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-zinc-400 font-mono">
          <span>Venue: Auditorium AB02 • VIT Bhopal</span>
          <span>Check-in: {team.checkedInVenue ? 'Checked In ✓' : 'Awaiting Check-in'}</span>
        </div>
      </div>
    </div>
  );
};
