"use client";

import React, { useState, useRef } from "react";
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
  Clock,
  Users,
  Printer,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
// ⚠️ Use html2canvas-pro, NOT html2canvas.
// Regular html2canvas throws on modern CSS `oklch()`/`oklab()` colors
// (which Tailwind v4 generates for every utility class), so any capture
// of a Tailwind-styled node silently fails. html2canvas-pro is a
// maintained drop-in fork that supports those color functions.
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
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

  const passCardRef = useRef<HTMLDivElement>(null);

  // --- Download state ---------------------------------------------------
  const [downloadState, setDownloadState] = useState<"idle" | "png" | "pdf" | "error">("idle");
  const [downloadError, setDownloadError] = useState<string | null>(null);

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

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/team/${team.id}`
    : `https://dsc-hackathon.vercel.app/team/${team.id}`;

  // -----------------------------------------------------------------------
  // Shared: render the pass card node to a canvas.
  // Capturing the node in-place (instead of cloning it into an offscreen
  // wrapper) avoids a whole class of bugs: CSS variables, web fonts, and
  // the QR code SVG can all fail to paint correctly on a detached clone
  // because computed styles / font loading don't always transfer.
  // -----------------------------------------------------------------------
  const captureCanvas = async (): Promise<HTMLCanvasElement> => {
    const node = passCardRef.current;
    if (!node) throw new Error("Pass card not found in DOM");

    // Make sure any web fonts (e.g. var(--font-heading)) are actually
    // painted before we snapshot, otherwise text can render in a
    // fallback font or be measured incorrectly.
    if (typeof document !== "undefined" && "fonts" in document) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(node, {
      scale: 2.5,
      backgroundColor: "#000000",
      useCORS: true,
      allowTaint: false,
      logging: false,
      // Improves reliability for the QR <svg> and any <img> logos.
      imageTimeout: 15000,
    });

    return canvas;
  };

  const downloadAsPNG = async (): Promise<void> => {
    const canvas = await captureCanvas();
    const link = document.createElement("a");
    link.download = `ORIGIN-PASS-${team.id}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  const downloadAsPDF = async (): Promise<void> => {
    const canvas = await captureCanvas();

    // Build a PDF page sized to the card's own aspect ratio (in mm),
    // instead of forcing it into a fixed A4 page — that's what was
    // causing cropped / mostly-blank PDF pages before.
    const pxToMm = (px: number) => px * 0.264583;
    const widthMm = pxToMm(canvas.width / 2.5); // divide back out the scale factor
    const heightMm = pxToMm(canvas.height / 2.5);

    const pdf = new jsPDF({
      orientation: widthMm > heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [widthMm, heightMm],
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    pdf.addImage(imgData, "JPEG", 0, 0, widthMm, heightMm, undefined, "FAST");
    pdf.save(`ORIGIN-PASS-${team.id}.pdf`);
  };

  // Master download: try PNG, then PDF, surface a real error instead of
  // a confirm()/print() dead end.
  const downloadPass = async (format: "png" | "pdf" = "png") => {
    setDownloadError(null);
    setDownloadState(format);
    try {
      if (format === "png") {
        await downloadAsPNG();
      } else {
        await downloadAsPDF();
      }
      setDownloadState("idle");
    } catch (error) {
      console.error(`Pass download (${format}) failed:`, error);
      setDownloadState("error");
      setDownloadError(
        error instanceof Error ? error.message : "Something went wrong generating the pass."
      );
    }
  };

  const isDownloading = downloadState === "png" || downloadState === "pdf";

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
                Registered: {team.registeredAt}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            
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

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={() => downloadPass("png")}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadState === "png" ? (
                    <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-orange-500" />
                  )}
                  <span>{downloadState === "png" ? "Generating PNG…" : "Download PNG"}</span>
                </button>

                <button
                  onClick={() => downloadPass("pdf")}
                  disabled={isDownloading}
                  className="px-4 py-2 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadState === "pdf" ? (
                    <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-orange-500" />
                  )}
                  <span>{downloadState === "pdf" ? "Generating PDF…" : "Download PDF"}</span>
                </button>
              </div>

              {downloadState === "error" && downloadError && (
                <div className="flex items-center gap-2 text-[11px] font-mono text-red-400 bg-red-950/30 border border-red-900/60 px-3 py-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{downloadError} — try again, or use your browser's Print → Save as PDF.</span>
                </div>
              )}
            </div>

            {/* Digital Pass Card */}
            <div
              ref={passCardRef}
              className="border border-neutral-700 bg-black text-white shadow-2xl relative print:border print:shadow-none"
            >
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

                {/* QR Code Section */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-1.5">
                      <QRCodeSVG
                        value={publicUrl}
                        size={80}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      <span className="block text-neutral-300 font-semibold">SCAN TO VIEW</span>
                      <span className="block">team details & check‑in status</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">QR • ORIGIN '26</span>
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