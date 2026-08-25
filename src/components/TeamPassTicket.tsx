import React, { useState } from 'react';
import { QrCode, ArrowRight, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
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
  onRefreshTeamData,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleLoginClick = onSwitchTeamLogin || onSwitchToTeamLogin;

  if (!team) {
    return (
      <div className="max-w-lg mx-auto px-6 pt-32 pb-16 text-center">
        <div className="comic-card p-10 max-w-md mx-auto border-3 border-[#FF5F00] shadow-[6px_6px_0px_#000]">
          <h2
            className="text-3xl font-bold mb-4 text-[#FF5F00] comic-title"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Authentication Required
          </h2>
          <p className="text-[14px] text-neutral-400 mb-8 font-body leading-relaxed">
            Sign in with your Team ID or Leader Email to view your Digital Pass.
          </p>
          <button
            onClick={handleLoginClick}
            className="btn-comic-primary w-full justify-center"
          >
            Sign In
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    );
  }

  const isVerified = team.paymentStatus === 'verified';

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16">
        <div className="comic-card p-8 border-3 border-[#FF5F00] shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-dashed border-[#FF5F00] pb-4">
            <div>
              <span className="text-[11px] font-mono text-[#FF5F00] font-bold uppercase tracking-wider block mb-1">
                Verification Pending
              </span>
              <h2
                className="text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Pass Locked
              </h2>
            </div>
            {onRefreshTeamData && (
              <button
                onClick={onRefreshTeamData}
                className="p-2 border-2 border-[#FF5F00] bg-black text-[#FF5F00] hover:text-[#FF8700] transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-[14px] text-[#FFC599] mb-6 font-body font-bold">
            Team <span className="text-[#FF5F00] font-extrabold">{team.teamName}</span> ({team.id}) — 
            awaiting admin payment verification.
          </p>

          <div className="border-3 border-[#FF5F00] divide-y-3 divide-[#FF5F00] bg-black">
            <div className="flex justify-between py-4 px-6 text-[13px] font-mono">
              <span className="text-neutral-500 font-bold">TRACK</span>
              <span className="text-[#FFC599] font-bold">{team.track}</span>
            </div>
            <div className="flex justify-between py-4 px-6 text-[13px] font-mono">
              <span className="text-neutral-500 font-bold">ACCESS PIN</span>
              <span className="text-[#FF5F00] font-bold">{team.accessCode}</span>
            </div>
            <div className="flex justify-between py-4 px-6 text-[13px] font-mono">
              <span className="text-neutral-500 font-bold">TRANSACTION UTR</span>
              <span className="text-[#FFC599] font-bold">{team.transactionRef}</span>
            </div>
            <div className="flex justify-between py-4 px-6 text-[13px] font-mono">
              <span className="text-neutral-500 font-bold">REGISTERED</span>
              <span className="text-[#FFC599] font-bold">{team.registeredAt}</span>
            </div>
            <div className="flex justify-between py-4 px-6 text-[13px] font-mono bg-neutral-950">
              <span className="text-neutral-500 font-bold">STATUS</span>
              <span className="text-[#FF5F00] font-bold uppercase animate-pulse">Awaiting Approval</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verified 3D Flip Pass (no white borders!)
  return (
    <div className="max-w-xl mx-auto px-6 pt-28 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[12px] font-mono text-[#FF5F00] uppercase tracking-widest block mb-1 font-bold">
            Entry Approved ✓
          </span>
          <h2
            className="text-4xl font-bold tracking-tight text-white comic-title"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Digital ID Pass
          </h2>
        </div>
        
        <div className="flex gap-2">
          {onRefreshTeamData && (
            <button
              onClick={onRefreshTeamData}
              className="p-2 border-2 border-[#FF5F00] bg-black text-[#FF5F00] hover:text-[#FF8700] transition-colors"
              title="Refresh Ticket Data"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          )}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-[11px] font-bold font-mono text-black bg-[#FF5F00] border-2 border-black px-3 py-1 hover:bg-[#FF8700] transition-colors"
          >
            FLIP CARD ↺
          </button>
        </div>
      </div>

      <div className="flip-card-container w-full h-[460px] md:h-[420px]">
        <motion.div
          className="flip-card-inner w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        >
          {/* Front Side: Outlined Paper Ticket */}
          <div className="flip-card-front comic-card p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden border-3 border-[#FF5F00] shadow-[6px_6px_0px_#000] bg-[#0D0E12]">
            {/* Edge ticket notches (circular cut-outs into black background) */}
            <div className="absolute top-1/2 left-[-12px] w-6 h-6 bg-black border-r-3 border-[#FF5F00] rounded-full -translate-y-1/2 z-10" />
            <div className="absolute top-1/2 right-[-12px] w-6 h-6 bg-black border-l-3 border-[#FF5F00] rounded-full -translate-y-1/2 z-10" />

            {/* Ticket Top details */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#FF5F00] pb-3 mb-5">
                <span
                  className="text-xl font-bold text-[#FFC599] tracking-wider"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  ORIGIN '26
                </span>
                <span className="text-[11px] font-mono text-black bg-[#FF5F00] border border-black px-2.5 py-0.5 font-bold uppercase">
                  ENTRY PASS
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                    TEAM NAME
                  </span>
                  <h3
                    className="text-2xl font-bold text-[#FF5F00]"
                    style={{ fontFamily: 'var(--font-subheading)' }}
                  >
                    {team.teamName}
                  </h3>
                  <span className="text-[12px] font-mono text-[#FFC599]">
                    ID: {team.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                      TRACK
                    </span>
                    <span className="text-[13px] text-[#FFC599] font-mono font-bold">{team.track}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block font-bold">
                      LEADER
                    </span>
                    <span className="text-[13px] text-[#FFC599] font-mono font-bold">{team.leader.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Dashed Tear Line */}
            <div className="border-t-3 border-dashed border-[#FF5F00]/40 my-4" />

            {/* Ticket Bottom section */}
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 block font-bold mb-1">
                  MEMBERS ({1 + (team.member2?.name ? 1 : 0) + (team.member3?.name ? 1 : 0) + (team.member4?.name ? 1 : 0)})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-mono text-[#FFC599] px-2 py-0.5 border border-[#FF5F00] bg-black">
                    {team.leader.name.split(' ')[0]}*
                  </span>
                  {team.member2?.name && (
                    <span className="text-[11px] font-mono text-[#FFC599] px-2 py-0.5 border border-[#FF5F00] bg-black">
                      {team.member2.name.split(' ')[0]}
                    </span>
                  )}
                  {team.member3?.name && (
                    <span className="text-[11px] font-mono text-[#FFC599] px-2 py-0.5 border border-[#FF5F00] bg-black">
                      {team.member3.name.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* QR Code Container styled in peach (no white) */}
              <div className="flex flex-col items-center justify-center p-3 border-2 border-black bg-[#FFC599] w-24 h-24 shrink-0 shadow-[2px_2px_0px_#000]">
                <QrCode className="w-16 h-16 text-black" />
                <span className="text-[8px] font-mono font-bold text-black uppercase tracking-wider mt-1">
                  SCANNABLE
                </span>
              </div>
            </div>

            {/* Footer stamp */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mt-2 border-t-2 border-dashed border-[#FF5F00]/25 pt-2">
              <span>AUDITORIUM AB02 · VIT BHOPAL</span>
              <span className={`font-bold uppercase ${team.checkedInVenue ? 'text-[#FF5F00]' : 'text-neutral-500'}`}>
                {team.checkedInVenue ? 'CHECKED IN ✓' : 'Awaiting Check-in'}
              </span>
            </div>
          </div>

          {/* Back Side: instructions and metadata */}
          <div className="flip-card-back comic-card-orange p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden border-3 border-black bg-[#FF5F00]">
            {/* Notches matching front */}
            <div className="absolute top-1/2 left-[-12px] w-6 h-6 bg-black border-r-3 border-black rounded-full -translate-y-1/2 z-10" />
            <div className="absolute top-1/2 right-[-12px] w-6 h-6 bg-black border-l-3 border-black rounded-full -translate-y-1/2 z-10" />

            <div>
              <div className="flex items-center justify-between border-b-2 border-dashed border-black pb-3 mb-5">
                <span
                  className="text-lg font-bold text-black tracking-wider"
                  style={{ fontFamily: 'var(--font-subheading)' }}
                >
                  TICKET METADATA
                </span>
                <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5">
                  INSTRUCTIONS
                </span>
              </div>

              <div className="space-y-4 text-black">
                <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-2">
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase opacity-60">TRANSACTION UTR</span>
                    <p className="text-[12px] font-mono font-bold break-all">{team.transactionRef}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase opacity-60">SECURITY PIN</span>
                    <p className="text-[12px] font-mono font-bold">{team.accessCode}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold uppercase opacity-60">VENUE PROTOCOLS</span>
                  <ul className="text-[11px] font-body font-bold space-y-1">
                    <li>• Bring official college/government photo ID cards.</li>
                    <li>• Check-in desks close strictly at 11:30 AM.</li>
                    <li>• Wi-Fi key & GPU credits distributed on entry.</li>
                    <li>• Keep this QR pass ready on your phone for scanning.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom details */}
            <div className="border-t-2 border-dashed border-black pt-4 flex items-center justify-between text-black text-[11px] font-mono font-bold">
              <span>REGISTERED: {team.registeredAt}</span>
              <span>DSC OPERATIONS</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action button */}
      {onNavigateToSubmit && (
        <button
          onClick={onNavigateToSubmit}
          className="mt-8 btn-comic-outline w-full justify-center"
        >
          Submit Your Project
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
