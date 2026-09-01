"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Send,
  GitBranch,
  Globe,
  FileText,
  Video,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Code,
  Layers,
  Upload,
  Lock,
  Plus,
  FileCheck,
  Clock,
  User,
  LogOut,
  File,
  X,
} from "lucide-react";
import { Team, TrackType } from "@/types";
import { HACKATHON_TRACKS } from "@/data/mockData";
import { DEFAULT_SUBMISSION_DEADLINE, isDeadlinePassed as checkDeadlinePassed } from "@/lib/deadline";
import { useTeams } from "@/context/TeamsContext";
import { useAuth } from "@/lib/authContext";

interface ProjectSubmissionModalProps {
  team: Team | null;
  onProjectSubmitted: (updatedTeam: Team) => void;
  onSwitchToTeamLogin: () => void;
}

const COMMON_TECH_STACK = [
  "Python", "PyTorch", "TensorFlow", "FastAPI", "React", "TypeScript",
  "TailwindCSS", "Next.js", "Node.js", "Express", "LangChain", "OpenCV",
  "Solidity", "Rust", "Docker", "PostgreSQL", "MongoDB", "Google Cloud",
];

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  team: propTeam,
  onProjectSubmitted,
  onSwitchToTeamLogin,
}) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { teams, activeTeam, setActiveTeam, clearActiveTeam, refreshData } = useTeams();

  const team = propTeam || activeTeam;

  const [isDirectLoginLoading, setIsDirectLoginLoading] = useState(false);
  const [directLoginError, setDirectLoginError] = useState<string | null>(null);
  const loginAttempted = useRef(false);

  useEffect(() => {
    if (!user?.email) return;
    if (team) return;
    if (loginAttempted.current) return;
    if (teams.length === 0) return;

    // ✅ Fix 1: store email in a local constant (TypeScript now knows it's not null)
    const userEmail = user.email;

    const loginWithEmail = async () => {
      loginAttempted.current = true;
      const cleanEmail = userEmail.trim().toLowerCase();

      const matched = teams.find((t) =>
        t.leader.email.toLowerCase() === cleanEmail ||
        t.member2?.email?.toLowerCase() === cleanEmail ||
        t.member3?.email?.toLowerCase() === cleanEmail ||
        t.member4?.email?.toLowerCase() === cleanEmail ||
        t.member5?.email?.toLowerCase() === cleanEmail
      );

      if (matched) {
        setActiveTeam(matched);
        return;
      }

      setIsDirectLoginLoading(true);
      setDirectLoginError(null);
      try {
        const res = await fetch("/api/auth/team-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: cleanEmail }),
        });
        const data = await res.json();

        if (res.ok && data.success && data.team) {
          setActiveTeam(data.team);
          refreshData();
        } else {
          setDirectLoginError(data.message || "No team found with this email.");
        }
      } catch (err) {
        setDirectLoginError("Failed to check team registration.");
      } finally {
        setIsDirectLoginLoading(false);
      }
    };

    loginWithEmail();
  }, [user, team, teams, setActiveTeam, refreshData]);

  const existingProject = team?.project;

  const [title, setTitle] = useState(existingProject?.title || "");
  const [tagline, setTagline] = useState(existingProject?.tagline || "");
  const [problemStatement, setProblemStatement] = useState(existingProject?.problemStatement || "");
  const [solutionDescription, setSolutionDescription] = useState(existingProject?.solutionDescription || "");
  const [track, setTrack] = useState<TrackType>(existingProject?.track || team?.track || "AI & Machine Learning");
  const [techStack, setTechStack] = useState<string[]>(existingProject?.techStack || ["React", "TypeScript", "FastAPI"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [githubUrl, setGithubUrl] = useState(existingProject?.githubUrl || "");
  const [deploymentUrl, setDeploymentUrl] = useState(existingProject?.deploymentUrl || "");

  // Two separate file upload states
  const [presentationPdfUrl, setPresentationPdfUrl] = useState(existingProject?.presentationPdfUrl || "");
  const [presentationPptUrl, setPresentationPptUrl] = useState(existingProject?.presentationPptUrl || "");
  const [presentationPdfFile, setPresentationPdfFile] = useState<File | null>(null);
  const [presentationPptFile, setPresentationPptFile] = useState<File | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isUploadingPpt, setIsUploadingPpt] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [videoUrl, setVideoUrl] = useState(existingProject?.videoUrl || "");

  const [deadline, setDeadline] = useState<string>(DEFAULT_SUBMISSION_DEADLINE);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(() => checkDeadlinePassed(DEFAULT_SUBMISSION_DEADLINE));
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isPassed: boolean;
  }>(() => {
    const target = new Date(DEFAULT_SUBMISSION_DEADLINE).getTime();
    const diff = target - Date.now();
    if (isNaN(target) || diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPassed: true };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      totalMs: diff,
      isPassed: false,
    };
  });
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/admin/submissions-status")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsSubmissionsOpen(data.submissionsOpen);
            if (data.deadline) setDeadline(data.deadline);
            if (typeof data.isDeadlinePassed === "boolean") setIsDeadlinePassed(data.isDeadlinePassed);
          }
        })
        .catch(() => {});
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(deadline).getTime();
      const diff = target - Date.now();
      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isPassed: true });
        setIsDeadlinePassed(true);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds, totalMs: diff, isPassed: false });
        setIsDeadlinePassed(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const toggleTechTag = (tag: string) => {
    if (techStack.includes(tag)) {
      setTechStack(techStack.filter((t) => t !== tag));
    } else {
      setTechStack([...techStack, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    if (customTagInput.trim() && !techStack.includes(customTagInput.trim())) {
      setTechStack([...techStack, customTagInput.trim()]);
      setCustomTagInput("");
    }
  };

  const uploadFileToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    let data: any;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      throw new Error(text || `Server returned non-JSON response (${res.status})`);
    }

    if (!res.ok || !data.success) {
      throw new Error(data?.message || "File upload failed");
    }

    return data.url;
  };

  const handleFileUpload = async (file: File, type: "pdf" | "ppt") => {
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File size exceeds 50MB limit. Selected file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (type === "pdf" && ext !== "pdf") {
      setUploadError("Please select a PDF file for the PDF attachment.");
      return;
    }
    if (type === "ppt" && !["ppt", "pptx"].includes(ext || "")) {
      setUploadError("Please select a PPT or PPTX file for the presentation attachment.");
      return;
    }

    setUploadError("");
    if (type === "pdf") {
      setPresentationPdfFile(file);
      setIsUploadingPdf(true);
      try {
        const url = await uploadFileToS3(file);
        setPresentationPdfUrl(url);
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload PDF file.");
      } finally {
        setIsUploadingPdf(false);
      }
    } else {
      setPresentationPptFile(file);
      setIsUploadingPpt(true);
      try {
        const url = await uploadFileToS3(file);
        setPresentationPptUrl(url);
      } catch (err: any) {
        setUploadError(err.message || "Failed to upload PPT/PPTX file.");
      } finally {
        setIsUploadingPpt(false);
      }
    }
  };

  const handleRemoveFile = (type: "pdf" | "ppt") => {
    if (type === "pdf") {
      setPresentationPdfFile(null);
      setPresentationPdfUrl("");
    } else {
      setPresentationPptFile(null);
      setPresentationPptUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!team) {
      setErrorMsg("Please log in with your Team ID first.");
      return;
    }

    if (isDeadlinePassed || checkDeadlinePassed(deadline)) {
      setIsDeadlinePassed(true);
      setErrorMsg("Submission deadline has passed. Late submissions are not accepted.");
      return;
    }

    if (!isSubmissionsOpen) {
      setErrorMsg("Project submissions are currently closed by the Admin! Submissions will open when enabled by the organizers.");
      return;
    }

    if (!title.trim() || !problemStatement.trim() || !solutionDescription.trim() || !githubUrl.trim()) {
      setErrorMsg("Please fill all mandatory fields: Title, Problem, Solution, and GitHub URL.");
      return;
    }

    // At least one presentation file or URL required
    if (!presentationPdfUrl && !presentationPptUrl) {
      setErrorMsg("Please upload at least one presentation file (PDF or PPT/PPTX) or provide a Google Slides/Canva link.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        tagline: tagline.trim(),
        problemStatement: problemStatement.trim(),
        solutionDescription: solutionDescription.trim(),
        track,
        techStack,
        githubUrl: githubUrl.trim(),
        deploymentUrl: deploymentUrl.trim() || undefined,
        presentationPdfUrl: presentationPdfUrl || undefined,
        presentationPptUrl: presentationPptUrl || undefined,
        videoUrl: videoUrl.trim() || undefined,
      };

      const res = await fetch(`/api/teams/${team.id}/project`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText = data?.message || "Failed to submit project.";
        if (errorText.toLowerCase().includes("deadline")) setIsDeadlinePassed(true);
        if (errorText.toLowerCase().includes("closed by the admin")) setIsSubmissionsOpen(false);
        throw new Error(errorText);
      }

      setSuccessMsg("Project details and presentation files saved! Jury members can now evaluate your project.");

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {}

      onProjectSubmitted(data.team);
    } catch (err: any) {
      setErrorMsg(err.message || "Error submitting project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <User className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
            AUTHENTICATION REQUIRED
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Team Authentication Required
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed font-mono">
            To submit or edit your project and upload your presentation slides (up to 50MB limit), please sign in with your Team ID or Leader Email.
          </p>
          <button
            onClick={onSwitchToTeamLogin}
            className="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs uppercase tracking-wider font-bold border border-orange-500 flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer"
          >
            <span>Sign In to Team Workspace</span>
          </button>
        </div>
      </div>
    );
  }

  if (isDirectLoginLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Verifying Team Membership...
          </h3>
        </div>
      </div>
    );
  }

  if (user && !team && !isDirectLoginLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-amber-400 mb-3">
            <AlertCircle className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
            NOT A TEAM LEADER
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Only Team Leaders Can Submit Projects
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed font-mono">
            You are signed in as <span className="text-white font-bold">{user.email}</span>, but this email is not the leader of any registered team.
          </p>
          {directLoginError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono">
              {directLoginError}
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={async () => {
                await signOut();
                clearActiveTeam();
              }}
              className="px-6 py-3 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Try Another Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isSubmissionsOpen) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-rose-400 mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono uppercase tracking-wider">
            <span>PORTAL STATUS: SUBMISSIONS CLOSED BY ORGANIZERS</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Project Submissions Are Currently Locked
          </h3>
          <p className="text-neutral-400 text-xs font-mono leading-relaxed max-w-md mx-auto">
            The 24-hour project submission window is currently disabled by the DSC Executive Panel.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Fix 2: guard against null team before rendering the main form
  if (!team) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 sm:pt-32 pb-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Code className="w-3.5 h-3.5" />
          <span>PROJECT SUBMISSION PORTAL • UNLOCKED</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          Submit Your Hackathon Project
        </h2>
        <p className="text-neutral-400 text-xs font-mono max-w-xl mx-auto">
          Submitting for <span className="text-white font-bold">{team.teamName}</span> ({team.id}) • Track: <span className="text-orange-400 font-semibold">{track}</span>
        </p>
      </div>

      <div className={`p-6 border transition-all ${
        isDeadlinePassed
          ? "bg-rose-950/20 border-rose-800/80 shadow-2xl"
          : "bg-black border-neutral-800 shadow-2xl"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className={`w-12 h-12 flex items-center justify-center shrink-0 border ${
              isDeadlinePassed
                ? "bg-rose-950/40 text-rose-400 border-rose-800/80"
                : "bg-orange-500/10 text-orange-400 border-orange-500/30"
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Submission Window
                </span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 border font-bold uppercase tracking-wider ${
                  isDeadlinePassed
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                    : "bg-orange-500/20 border-orange-500/40 text-orange-300 animate-pulse"
                }`}>
                  {isDeadlinePassed ? "DEADLINE PASSED • CLOSED" : "LIVE COUNTDOWN"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {isDeadlinePassed
                  ? "The submission deadline has officially ended. Late submissions are strictly rejected."
                  : "Submissions strictly lock at 11:00 AM Code Freeze."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {timeLeft.days > 0 && (
              <>
                <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
                  <div className="text-xl font-extrabold text-white leading-tight">
                    {String(timeLeft.days).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase">Days</div>
                </div>
                <span className="text-neutral-600 font-bold text-lg">:</span>
              </>
            )}
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? "text-rose-400" : "text-orange-500"}`}>
                {String(timeLeft.hours).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase">Hours</div>
            </div>
            <span className="text-neutral-600 font-bold text-lg">:</span>
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? "text-rose-400" : "text-orange-500"}`}>
                {String(timeLeft.minutes).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase">Mins</div>
            </div>
            <span className="text-neutral-600 font-bold text-lg">:</span>
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? "text-rose-400" : "text-orange-500"}`}>
                {String(timeLeft.seconds).padStart(2, "0")}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-mono flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-orange-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800 text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
            <Layers className="w-5 h-5 text-orange-500" />
            <h3>1. Project Concept & Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Project Title <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NeuroVision AI, ZeroFraud Gateway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Catchy Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Real-time UPI transaction interceptor."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Problem Statement <span className="text-orange-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="What problem does your project solve?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-3.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Proposed Solution <span className="text-orange-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe your technical architecture and solution."
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              className="w-full bg-black border border-neutral-800 focus:border-orange-500 p-3.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
              Target Track (Domain)
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as TrackType)}
              className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono focus:outline-none transition-colors cursor-pointer"
            >
              {HACKATHON_TRACKS.map((t, idx) => (
                <option key={idx} value={t.name} className="bg-black text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TECHNOLOGIES USED */}
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5 text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
              <Code className="w-5 h-5 text-orange-500" />
              <h3>2. Technologies Used</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">{techStack.length} selected</span>
          </div>

          {/* Selected tags (pills) */}
          <div className="flex flex-wrap gap-2">
            {techStack.length === 0 ? (
              <span className="text-xs text-neutral-500 font-mono">No technologies selected yet.</span>
            ) : (
              techStack.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 border border-orange-500/50 text-orange-400 font-mono text-xs font-semibold uppercase tracking-wider"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTechStack(techStack.filter((t) => t !== tag))}
                    className="text-orange-400 hover:text-orange-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Common tags (click to toggle) */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
            {COMMON_TECH_STACK.map((tag) => {
              const isSelected = techStack.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTechTag(tag)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider cursor-pointer transition-colors border ${
                    isSelected
                      ? "bg-orange-600 text-white font-bold border-orange-500"
                      : "bg-black text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Add custom tag */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
            <input
              type="text"
              placeholder="Add other technologies..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              className="flex-1 bg-black border border-neutral-800 focus:border-orange-500 px-4 py-2.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2.5 bg-black hover:bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-orange-500" />
              Add
            </button>
          </div>
        </div>

        {/* CODE & PRESENTATION DELIVERABLES */}
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800 text-white font-bold text-base" style={{ fontFamily: "var(--font-heading)" }}>
            <Globe className="w-5 h-5 text-orange-500" />
            <h3>3. Code & Presentation Deliverables</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-neutral-500" />
                GitHub Repository URL <span className="text-orange-500">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/your-team/origin-hack"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-neutral-500" />
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="p-5 bg-black border border-neutral-800 space-y-6 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-300 uppercase tracking-wider font-semibold">Upload Presentation Files (Max 2 files)</span>
              <span className="text-[10px] text-orange-400 px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 uppercase font-bold">
                MAX SIZE: 50MB EACH
              </span>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  PDF Document (Optional)
                </label>
                {presentationPdfUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile("pdf")}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
              {!presentationPdfUrl ? (
                <div className="relative border border-dashed border-neutral-800 hover:border-orange-500/60 p-4 text-center cursor-pointer transition-colors bg-black">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "pdf");
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingPdf}
                  />
                  <Upload className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <span className="text-xs text-neutral-300 font-mono block">
                    {isUploadingPdf ? "Uploading PDF..." : "Click or drag PDF (max 50MB)"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-black border border-orange-500/30 text-xs">
                  <span className="text-orange-400 font-mono flex items-center gap-1.5 font-bold">
                    <FileCheck className="w-4 h-4" /> PDF Attached
                  </span>
                  <a
                    href={presentationPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-400 hover:underline font-semibold"
                  >
                    Preview PDF &rarr;
                  </a>
                </div>
              )}
            </div>

            {/* PPT/PPTX Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-neutral-400 font-mono flex items-center gap-1.5">
                  <File className="w-3.5 h-3.5 text-orange-500" />
                  PPT / PPTX Presentation (Optional)
                </label>
                {presentationPptUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile("ppt")}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
              {!presentationPptUrl ? (
                <div className="relative border border-dashed border-neutral-800 hover:border-orange-500/60 p-4 text-center cursor-pointer transition-colors bg-black">
                  <input
                    type="file"
                    accept=".ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "ppt");
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isUploadingPpt}
                  />
                  <Upload className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <span className="text-xs text-neutral-300 font-mono block">
                    {isUploadingPpt ? "Uploading PPT/PPTX..." : "Click or drag PPT/PPTX (max 50MB)"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-black border border-orange-500/30 text-xs">
                  <span className="text-orange-400 font-mono flex items-center gap-1.5 font-bold">
                    <FileCheck className="w-4 h-4" /> PPT/PPTX Attached
                  </span>
                  <a
                    href={presentationPptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-400 hover:underline font-semibold"
                  >
                    Preview PPT &rarr;
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-neutral-800">
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1">
                Or paste direct Google Slides / Canva Presentation link (optional):
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-2 gap-3">
          {isDeadlinePassed && (
            <p className="text-xs text-rose-400 font-mono font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Submissions are closed. The hackathon deadline has officially passed.</span>
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting || isUploadingPdf || isUploadingPpt || isDeadlinePassed}
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors border ${
              isDeadlinePassed
                ? "bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-60"
                : "bg-orange-600 hover:bg-orange-500 text-white border-orange-500 cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <span>Saving Deliverables...</span>
            ) : isDeadlinePassed ? (
              <>
                <Lock className="w-4 h-4 text-neutral-500" />
                <span>Submissions Closed (Deadline Passed)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{existingProject ? "Update Project Deliverables" : "Submit 24-Hour Project"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};