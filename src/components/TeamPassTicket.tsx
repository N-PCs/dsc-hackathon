import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Ticket,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  Building2,
  ExternalLink,
  Code,
  QrCode,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Team } from '../types';

interface TeamPassTicketProps {
  team: Team | null;
  onNavigateToSubmit: () => void;
  onSwitchTeamLogin: () => void;
  onRefreshTeamData?: () => void;
}

export const TeamPassTicket: React.FC<TeamPassTicketProps> = ({
  team,
  onNavigateToSubmit,
  onSwitchTeamLogin,
  onRefreshTeamData,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Generate QR Code containing verifiable pass payload
  useEffect(() => {
    if (team) {
      const qrPayload = JSON.stringify({
        id: team.id,
        teamName: team.teamName,
        leader: team.leader.name,
        track: team.track,
        paymentStatus: team.paymentStatus,
        checkIn: team.checkedInVenue,
        event: 'ORIGIN-OVERNIGHT-2026',
      });

      QRCode.toDataURL(
        qrPayload,
        {
          width: 280,
          margin: 1,
          color: {
            dark: '#030712',
            light: '#ffffff',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
  }, [team]);

  const handleCopyCredentials = () => {
    if (!team) return;
    navigator.clipboard.writeText(
      `ORIGIN '26 HACKATHON PASS\nTeam ID: ${team.id}\nTeam Name: ${team.teamName}\nLeader: ${team.leader.name}\nAccess Code: ${team.accessCode}\nTrack: ${team.track}\nStatus: ${team.paymentStatus.toUpperCase()}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!team) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-white/10 mx-auto flex items-center justify-center text-zinc-400 mb-4">
          <Ticket className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-2">No Active Team Pass Found</h3>
        <p className="text-sm text-zinc-400 mb-6">
          Register a new team or enter your existing Team ID / Leader Email to retrieve your digital entry pass and project workspace.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSwitchTeamLogin}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-md cursor-pointer"
          >
            Look Up My Team
          </button>
        </div>
      </div>
    );
  }

  // Count team members
  const memberList = [
    { ...team.leader, isLeader: true },
    ...(team.member2?.name ? [{ ...team.member2, isLeader: false }] : []),
    ...(team.member3?.name ? [{ ...team.member3, isLeader: false }] : []),
    ...(team.member4?.name ? [{ ...team.member4, isLeader: false }] : []),
  ];

  const isVerified = team.paymentStatus === 'verified';
  const isPending = team.paymentStatus === 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              OFFICIAL HACKER CREDENTIALS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            Team Pass & Digital ID Badge
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyCredentials}
            className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#18181b] border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied!' : 'Copy Credentials'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#111114] hover:bg-[#18181b] border border-white/10 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Badge</span>
          </button>

          <button
            onClick={onSwitchTeamLogin}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1 underline"
          >
            Switch Team
          </button>
        </div>
      </div>

      {/* Verification Status Alert */}
      {isPending && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 shrink-0 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div>
              <span className="font-bold">Payment Verification Pending: </span>
              DSC Admins are reviewing transaction ref <span className="font-mono text-white font-bold">{team.transactionRef}</span>. Your ticket QR will be active for venue check-in once verified.
            </div>
          </div>
          {onRefreshTeamData && (
            <button
              onClick={onRefreshTeamData}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold rounded-lg shrink-0 cursor-pointer"
            >
              Check Status
            </button>
          )}
        </div>
      )}

      {isVerified && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <div>
            <span className="font-bold">Entry Pass Verified & Active: </span>
            Your team is verified for physical venue access, overnight food coupons, and 24-hour project submission.
          </div>
        </div>
      )}

      {/* THE DIGITAL TICKET / ID BADGE */}
      <div
        ref={ticketRef}
        id="digital-hackathon-badge"
        className="relative bg-gradient-to-br from-[#111114] via-[#16161b] to-[#111114] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
      >
        {/* Decorative ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Badge Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1.5px]">
              <div className="w-full h-full bg-[#111114] rounded-[14px] flex items-center justify-center">
                <Ticket className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-white tracking-wider">
                  ORIGIN '26
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  OVERNIGHT HACK
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Data Science Club • VIT Bhopal
              </p>
            </div>
          </div>

          {/* Status Stamp */}
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl text-xs font-mono font-extrabold tracking-wider uppercase border ${
                isVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              }`}
            >
              {isVerified ? 'VERIFIED PASS' : 'PENDING APPROVAL'}
            </div>
          </div>
        </div>

        {/* Badge Body */}
        <div className="py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Team Profile */}
          <div className="lg:col-span-8 space-y-5">
            <div>
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                Team Identifier
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  {team.teamName}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-[#18181b] text-emerald-400 border border-white/10">
                  {team.id}
                </span>
              </div>
            </div>

            {/* Track badge & Access Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Assigned Track
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {team.track}
                </span>
              </div>

              <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/10">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">
                  Team Access Code (PIN)
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-widest">
                  {team.accessCode}
                </span>
              </div>
            </div>

            {/* Roster list */}
            <div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2.5">
                Authorized Team Roster ({memberList.length} Members)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {memberList.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#18181b] border border-white/10 rounded-xl flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-zinc-200 truncate flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.isLeader && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            LEAD
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono block truncate">
                        {m.email}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: QR Gate Scanner */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-[#18181b] border border-white/10 rounded-2xl text-center">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-2.5 font-bold">
              VENUE GATE PASS QR
            </span>
            <div className="p-2.5 bg-white rounded-xl shadow-lg mb-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Team Pass QR"
                  className="w-36 h-36 mx-auto object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-zinc-400">
                  <QrCode className="w-16 h-16 animate-pulse" />
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {team.id}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              Scan at Entrance for Hacker Kit & Badge
            </span>
          </div>
        </div>

        {/* Badge Footer: Barcode simulation & Registered timestamp */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-400 gap-2">
          <div>
            Registered: <span className="text-zinc-300">{team.registeredAt}</span>
          </div>
          <div className="flex items-center gap-1 opacity-70">
            <span>||| | |||| || ||||| ||| |||| ||</span>
            <span className="text-zinc-500">ORIGIN-2026-TOKEN</span>
          </div>
        </div>
      </div>

      {/* Project Submission Action card */}
      <div className="mt-8 bg-[#111114] border border-emerald-500/20 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-1">
              <Code className="w-4 h-4" />
              <span>24-HOUR PROJECT SUBMISSION PORTAL</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              {team.project ? 'Project Details Submitted' : 'Ready to submit your Hackathon Project?'}
            </h3>
            <p className="text-zinc-400 text-xs mt-1 max-w-xl">
              {team.project
                ? `Current project: "${team.project.title}". You can refine your GitHub, deployment, and presentation links anytime before code freeze.`
                : 'Submit your GitHub repository, live deployment URL, project problem statement, and presentation deck for jury grading.'}
            </p>
          </div>

          <button
            id="pass-btn-submit-project"
            onClick={onNavigateToSubmit}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{team.project ? 'Edit Project Submission' : 'Submit Project Now'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
