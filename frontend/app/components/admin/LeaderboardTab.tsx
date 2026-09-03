"use client";

import React from "react";
import { Team } from "@/types";

interface LeaderboardTabProps {
  leaderboardTeams: Team[];
  isLoadingSubmissions: boolean;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ leaderboardTeams, isLoadingSubmissions }) => {
  return (
    <div className="space-y-4">
      <div className="bg-black border border-neutral-800 overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900 text-neutral-500 uppercase text-[11px] tracking-wider border-b border-neutral-800">
            <tr>
              <th className="p-3.5">Rank</th>
              <th className="p-3.5">Project & Team</th>
              <th className="p-3.5">Track</th>
              <th className="p-3.5">Innovation</th>
              <th className="p-3.5">Tech Depth</th>
              <th className="p-3.5">UI/UX</th>
              <th className="p-3.5">Pitch</th>
              <th className="p-3.5">Impact</th>
              <th className="p-3.5 font-bold text-right">Total Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-900">
            {isLoadingSubmissions ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-neutral-500">
                  Loading leaderboard...
                </td>
              </tr>
            ) : leaderboardTeams.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-neutral-500">
                  No evaluated submissions available for the leaderboard yet.
                </td>
              </tr>
            ) : (
              leaderboardTeams.map((team, idx) => {
                const score = team.project?.score;
                return (
                  <tr key={team.id} className="hover:bg-neutral-950 transition-colors text-neutral-300">
                    <td className="p-3.5 font-bold">
                      <span className="w-6 h-6 inline-flex items-center justify-center text-xs font-mono text-orange-400 bg-orange-500/10 border border-orange-500/30">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                        {team.project?.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {team.teamName} ({team.id})
                      </div>
                    </td>
                    <td className="p-3.5 text-neutral-300">{team.track}</td>
                    <td className="p-3.5 text-neutral-400">{score ? `${score.innovation}/20` : "-"}</td>
                    <td className="p-3.5 text-neutral-400">{score ? `${score.technicalComplexity}/20` : "-"}</td>
                    <td className="p-3.5 text-neutral-400">{score ? `${score.uiUx}/20` : "-"}</td>
                    <td className="p-3.5 text-neutral-400">{score ? `${score.presentation}/20` : "-"}</td>
                    <td className="p-3.5 text-neutral-400">{score ? `${score.impact}/20` : "-"}</td>
                    <td className="p-3.5 text-right font-bold text-base text-orange-400">
                      {score ? `${score.total}/100` : "Unscored"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};