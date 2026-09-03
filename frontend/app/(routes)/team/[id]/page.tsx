"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Team } from "@/types";

export default function PublicTeamPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${id}`);
        const data = await res.json();
        if (data.success && data.team) {
          setTeam(data.team);
        } else {
          setError("Team not found.");
        }
      } catch (_) {
        setError("Failed to load team details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="max-w-md bg-black border border-neutral-800 p-8 text-center">
          <h2 className="font-display text-3xl text-orange-500 mb-3">Team Not Found</h2>
          <p className="text-sm text-neutral-400 font-mono">{error || "Invalid team ID"}</p>
        </div>
      </div>
    );
  }

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

  const isVerified = team.paymentStatus === "verified";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full border border-neutral-800 bg-black shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-display text-2xl text-white tracking-wider">ORIGIN '26</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-[11px] font-mono text-neutral-400">18H HACKATHON · 4‑5 SEP</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-white">{team.teamName}</h1>
            <p className="text-sm font-mono text-orange-400">ID: {team.id}</p>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-mono font-bold uppercase px-3 py-1 border ${
                isVerified
                  ? "text-orange-500 border-orange-500/50 bg-orange-500/10"
                  : "text-amber-400 border-amber-500/50 bg-amber-500/10"
              }`}
            >
              {isVerified ? "Verified Entry ✓" : "Verification Pending"}
            </span>
          </div>
        </div>

        {/* Leader & Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Leader Name</span>
            <p className="text-white font-semibold font-mono">{team.leader.name}</p>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-3 mb-1">Contact</span>
            <p className="text-neutral-300 font-mono text-sm">{team.leader.phone || team.leader.email}</p>
            {team.leader.registrationNumber && (
              <>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-3 mb-1">Registration No.</span>
                <p className="text-neutral-300 font-mono text-sm">{team.leader.registrationNumber}</p>
              </>
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Track</span>
            <p className="text-orange-400 font-mono font-bold">{team.track}</p>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-3 mb-1">Fee Paid</span>
            <p className="text-white font-mono font-bold">₹{team.amountPaid || 0}</p>
            <span className="text-[10px] font-mono text-neutral-500 uppercase block mt-3 mb-1">UTR</span>
            <p className="text-neutral-300 font-mono text-sm break-all">{team.transactionRef || "N/A"}</p>
          </div>
        </div>

        {/* Members */}
        <div className="pt-4 border-t border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-3">Confirmed Team Members ({members.length})</span>
          <div className="flex flex-wrap gap-2">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="text-xs font-mono px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-200 flex items-center gap-1.5"
              >
                <span className="text-orange-500 font-bold">{idx === 0 ? "★ Leader:" : `M${idx + 1}:`}</span>
                <span>{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue + Check-in */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-neutral-400">AB02 Auditorium 1 & 2 · VIT Bhopal University</span>
          <span
            className={`text-xs font-mono font-bold ${
              team.checkedInVenue ? "text-orange-500" : "text-neutral-500"
            }`}
          >
            {team.checkedInVenue ? "✅ CHECKED IN" : "⏳ AWAITING CHECK‑IN"}
          </span>
        </div>
      </div>
    </div>
  );
}