import React from 'react';
import { QrCode, ArrowRight } from 'lucide-react';
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
      <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
        <h2
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Team Authentication Required
        </h2>
        <p className="text-[14px] text-neutral-400 mb-8">
          Sign in with your Team ID or Leader Email to view your Digital Pass.
        </p>
        <button
          onClick={handleLoginClick}
          className="btn-primary"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const isVerified = team.paymentStatus === 'verified';

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <span className="text-[13px] font-mono text-amber-500 uppercase tracking-wider block mb-3">
            Pending Verification
          </span>
          <h2
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Pass Locked
          </h2>
          <p className="text-[14px] text-neutral-400">
            Team <span className="text-white font-semibold">{team.teamName}</span> ({team.id}) — 
            awaiting admin payment verification.
          </p>
        </div>

        <div className="border border-neutral-800 divide-y divide-neutral-800">
          <div className="flex justify-between py-4 px-6 text-[14px]">
            <span className="text-neutral-500">Track</span>
            <span className="text-white font-medium">{team.track}</span>
          </div>
          <div className="flex justify-between py-4 px-6 text-[14px]">
            <span className="text-neutral-500">Access Code</span>
            <span className="text-white font-mono font-medium">{team.accessCode}</span>
          </div>
          <div className="flex justify-between py-4 px-6 text-[14px]">
            <span className="text-neutral-500">Transaction Ref</span>
            <span className="text-white font-mono font-medium">{team.transactionRef}</span>
          </div>
          <div className="flex justify-between py-4 px-6 text-[14px]">
            <span className="text-neutral-500">Registered</span>
            <span className="text-white font-medium">{team.registeredAt}</span>
          </div>
          <div className="flex justify-between py-4 px-6 text-[14px]">
            <span className="text-neutral-500">Status</span>
            <span className="text-amber-500 font-semibold">Pending Admin Approval</span>
          </div>
        </div>
      </div>
    );
  }

  // Verified pass
  return (
    <div className="max-w-2xl mx-auto px-6 pt-24 pb-16">
      <div className="mb-8">
        <span className="text-[13px] font-mono text-blue-500 uppercase tracking-wider block mb-3">
          Verified — Entry Approved
        </span>
        <h2
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Digital ID Pass
        </h2>
        <p className="text-[14px] text-neutral-400 mt-2">
          Present this pass at the venue check-in desk for entry badges and swag kits.
        </p>
      </div>

      {/* Pass card */}
      <div className="border border-neutral-700">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span
              className="text-[15px] font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              ORIGIN '26
            </span>
            <span className="w-1 h-1 rounded-full bg-blue-600" />
            <span className="text-[11px] font-mono text-neutral-500">24H HACKATHON</span>
          </div>
          <span className="text-[11px] font-mono text-blue-500 font-semibold uppercase">
            Verified ✓
          </span>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
          {/* Details */}
          <div className="sm:col-span-2 p-6 space-y-5">
            <div>
              <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-1">
                Team
              </span>
              <h3
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {team.teamName}
              </h3>
              <span className="text-[12px] font-mono text-neutral-500">
                {team.id} · PIN: {team.accessCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-1">
                  Track
                </span>
                <span className="text-[14px] text-white font-medium">{team.track}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-1">
                  Leader
                </span>
                <span className="text-[14px] text-white font-medium">{team.leader.name}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-neutral-600 uppercase block mb-2">
                Members ({1 + (team.member2?.name ? 1 : 0) + (team.member3?.name ? 1 : 0) + (team.member4?.name ? 1 : 0)})
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="text-[12px] font-mono text-neutral-300 px-3 py-1 border border-neutral-800">
                  {team.leader.name} ★
                </span>
                {team.member2?.name && (
                  <span className="text-[12px] font-mono text-neutral-400 px-3 py-1 border border-neutral-800">
                    {team.member2.name}
                  </span>
                )}
                {team.member3?.name && (
                  <span className="text-[12px] font-mono text-neutral-400 px-3 py-1 border border-neutral-800">
                    {team.member3.name}
                  </span>
                )}
                {team.member4?.name && (
                  <span className="text-[12px] font-mono text-neutral-400 px-3 py-1 border border-neutral-800">
                    {team.member4.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-6 bg-white">
            <QrCode className="w-24 h-24 text-black" />
            <span className="text-[10px] font-mono font-bold text-black mt-2 uppercase">
              Entry Pass
            </span>
            <span className="text-[9px] font-mono text-neutral-600">{team.id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 text-[12px] font-mono text-neutral-500">
          <span>Auditorium AB02 · VIT Bhopal</span>
          <span className={team.checkedInVenue ? 'text-blue-500' : ''}>
            {team.checkedInVenue ? 'Checked In ✓' : 'Awaiting Check-in'}
          </span>
        </div>
      </div>

      {/* Action */}
      {onNavigateToSubmit && (
        <button
          onClick={onNavigateToSubmit}
          className="mt-8 btn-outline w-full justify-center"
        >
          Submit Your Project
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
