"use client";

import React from "react";
import { FileText, File, GitBranch, Globe } from "lucide-react";
import { Team } from "@/types";

interface SubmissionsTabProps {
  submittedTeams: Team[];
  isLoadingSubmissions: boolean;
}

export const SubmissionsTab: React.FC<SubmissionsTabProps> = ({
  submittedTeams,
  isLoadingSubmissions,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-800 border border-neutral-800">
        {isLoadingSubmissions ? (
          <div className="col-span-3 py-16 text-center text-neutral-500 bg-black">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto mb-3" />
            <p className="text-xs font-mono">Loading submissions...</p>
          </div>
        ) : submittedTeams.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-neutral-500 bg-black">
            <FileText className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
            <div className="font-bold text-white font-mono">No 24H Project Submissions Yet</div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">Teams will submit deliverables during the sprint.</p>
          </div>
        ) : (
          submittedTeams.map((team) => {
            const proj = team.project!;
            const isScored = !!proj.score;

            return (
              <div
                key={team.id}
                className="bg-black p-6 space-y-4 hover:bg-neutral-950 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-orange-400 font-bold px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 uppercase tracking-wider">
                      {team.id}
                    </span>
                    {isScored ? (
                      <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 border border-orange-500/30">
                        Score: {proj.score?.total}/100
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30 uppercase tracking-wider">
                        Pending Evaluation
                      </span>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    {proj.title}
                  </h4>
                  <p className="text-xs text-neutral-400 italic">{proj.tagline || "No tagline provided"}</p>
                  <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">{proj.solutionDescription}</p>

                  <div className="flex flex-wrap gap-1 pt-1 font-mono">
                    {proj.techStack?.map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-black border border-neutral-800 text-neutral-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-900 space-y-3 font-mono">
                  {/* Attachment Links */}
                  {(proj.presentationPdfUrl || proj.presentationPptUrl) && (
                    <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-neutral-800/50">
                      {proj.presentationPdfUrl && (
                        <a
                          href={proj.presentationPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-blue-400 hover:underline flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3" /> PDF
                        </a>
                      )}
                      {proj.presentationPptUrl && (
                        <a
                          href={proj.presentationPptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-mono text-purple-400 hover:underline flex items-center gap-1 transition-colors"
                        >
                          <File className="w-3 h-3" /> PPT/PPTX
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline flex items-center gap-1 text-[11px]">
                      <GitBranch className="w-3.5 h-3.5" /> Repository &rarr;
                    </a>
                    {proj.deploymentUrl && (
                      <a href={proj.deploymentUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]">
                        <Globe className="w-3.5 h-3.5" /> Live Demo &rarr;
                      </a>
                    )}
                  </div>

                 
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};