"use client";

import React, { useState } from "react";
import { Team } from "@/types";

export interface ScorePayload {
  innovation: number;
  technicalComplexity: number;
  uiUx: number;
  presentation: number;
  impact: number;
  feedback: string;
}

interface ScoringModalProps {
  team: Team;
  onClose: () => void;
  onSave: (teamId: string, score: ScorePayload) => void;
}

export const ScoringModal: React.FC<ScoringModalProps> = ({ team, onClose, onSave }) => {
  const [scores, setScores] = useState<ScorePayload>(
    team.project?.score
      ? {
          innovation: team.project.score.innovation,
          technicalComplexity: team.project.score.technicalComplexity,
          uiUx: team.project.score.uiUx,
          presentation: team.project.score.presentation,
          impact: team.project.score.impact,
          feedback: team.project.score.feedback || "",
        }
      : {
          innovation: 18,
          technicalComplexity: 18,
          uiUx: 17,
          presentation: 18,
          impact: 18,
          feedback: "Solid implementation and architecture.",
        }
  );

  const clampScore = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return 0;
    return Math.min(20, Math.max(0, num));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { innovation, technicalComplexity, uiUx, presentation, impact } = scores;
    const allValid = [innovation, technicalComplexity, uiUx, presentation, impact].every(
      (v) => v >= 0 && v <= 20
    );
    if (!allValid) {
      alert("All scores must be between 0 and 20.");
      return;
    }

    onSave(team.id, scores);
  };

  const total = scores.innovation + scores.technicalComplexity + scores.uiUx + scores.presentation + scores.impact;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-black border border-neutral-800 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h4 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Jury Evaluation Sheet
            </h4>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {team.project?.title} • {team.teamName}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-xs px-3 py-1 bg-black border border-neutral-800 cursor-pointer font-mono uppercase">
            ✕ Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Innovation (/20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scores.innovation}
                onChange={(e) => setScores({ ...scores, innovation: clampScore(e.target.value) })}
                className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Tech Depth (/20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scores.technicalComplexity}
                onChange={(e) => setScores({ ...scores, technicalComplexity: clampScore(e.target.value) })}
                className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">UI/UX (/20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scores.uiUx}
                onChange={(e) => setScores({ ...scores, uiUx: clampScore(e.target.value) })}
                className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Presentation (/20)</label>
              <input
                type="number"
                min="0"
                max="20"
                value={scores.presentation}
                onChange={(e) => setScores({ ...scores, presentation: clampScore(e.target.value) })}
                className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Impact & Feasibility (/20)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={scores.impact}
              onChange={(e) => setScores({ ...scores, impact: clampScore(e.target.value) })}
              className="w-full bg-black border border-neutral-800 p-2.5 text-white font-mono outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Jury Feedback / Recommendations</label>
            <textarea
              rows={2}
              value={scores.feedback}
              onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
              placeholder="Outstanding work on the model quantization..."
              className="w-full bg-black border border-neutral-800 p-2.5 text-white resize-none placeholder:text-neutral-600 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="p-3.5 bg-orange-500/10 border border-orange-500/30 flex items-center justify-between font-mono">
            <span className="text-orange-400 font-bold uppercase tracking-wider text-[11px]">TOTAL SCORE:</span>
            <span className="text-base font-extrabold text-white">{total} / 100</span>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 font-mono">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-black border border-neutral-800 text-neutral-300 text-xs uppercase cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider border border-orange-500 cursor-pointer">
              Save Score & Update Rank
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};