import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  Github,
  Globe,
  FileText,
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
} from 'lucide-react';
import { Team, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { uploadDirectToImagekit } from '../lib/imagekitClient';
import { DEFAULT_SUBMISSION_DEADLINE, isDeadlinePassed as checkDeadlinePassed } from '../lib/deadline';


interface ProjectSubmissionModalProps {
  team: Team | null;
  onProjectSubmitted: (updatedTeam: Team) => void;
  onSwitchToTeamLogin: () => void;
}

const COMMON_TECH_STACK = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'FastAPI',
  'React',
  'TypeScript',
  'TailwindCSS',
  'Next.js',
  'Node.js',
  'Express',
  'LangChain',
  'OpenCV',
  'Solidity',
  'Rust',
  'Docker',
  'PostgreSQL',
  'MongoDB',
  'Google Cloud',
];

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  team,
  onProjectSubmitted,
  onSwitchToTeamLogin,
}) => {
  const existingProject = team?.project;

  const [title, setTitle] = useState(existingProject?.title || '');
  const [tagline, setTagline] = useState(existingProject?.tagline || '');
  const [problemStatement, setProblemStatement] = useState(existingProject?.problemStatement || '');
  const [solutionDescription, setSolutionDescription] = useState(existingProject?.solutionDescription || '');
  const [track, setTrack] = useState<TrackType>(existingProject?.track || team?.track || 'AI & Machine Learning');
  const [techStack, setTechStack] = useState<string[]>(
    existingProject?.techStack || ['React', 'TypeScript', 'FastAPI']
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [githubUrl, setGithubUrl] = useState(existingProject?.githubUrl || '');
  const [deploymentUrl, setDeploymentUrl] = useState(existingProject?.deploymentUrl || '');
  const [presentationUrl, setPresentationUrl] = useState(existingProject?.presentationUrl || '');
  const [presentationFileName, setPresentationFileName] = useState('');

  // Submitting states & deadline lock state
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
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check backend submission gate status & deadline on load and periodically
  React.useEffect(() => {
    const fetchStatus = () => {
      fetch('/api/admin/submissions-status')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsSubmissionsOpen(data.submissionsOpen);
            if (data.deadline) {
              setDeadline(data.deadline);
            }
            if (typeof data.isDeadlinePassed === 'boolean') {
              setIsDeadlinePassed(data.isDeadlinePassed);
            }
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    // Periodically poll (every 10s) to keep frontend synced with admin toggles
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Live countdown timer ticking every second
  React.useEffect(() => {
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
    if ('key' in e && e.key !== 'Enter') return;
    if (customTagInput.trim() && !techStack.includes(customTagInput.trim())) {
      setTechStack([...techStack, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  // Upload PPT / PDF File to Imagekit (10MB limit enforcement)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(`File size exceeds 10MB limit. Selected file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    setPresentationFileName(file.name);
    setIsUploadingDoc(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let data: any;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Server returned non-JSON response (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.message || 'File upload failed');
      }

      setPresentationUrl(data.url);
      setSuccessMsg(`PPT/PDF document successfully uploaded! (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading PPT/PDF document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Submit Project Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!team) {
      setErrorMsg('Please log in with your Team ID first.');
      return;
    }

    if (team.paymentStatus !== 'verified') {
      setErrorMsg('Project submission is locked! Admin payment verification is required.');
      return;
    }

    // STRICT DEADLINE & ADMIN LOCK CHECK
    if (isDeadlinePassed || checkDeadlinePassed(deadline)) {
      setIsDeadlinePassed(true);
      setErrorMsg('Submission deadline has passed. Late submissions are not accepted.');
      return;
    }

    if (!isSubmissionsOpen) {
      setErrorMsg('Project submissions are currently closed by the Admin! Submissions will open when enabled by the organizers.');
      return;
    }

    if (!title.trim() || !problemStatement.trim() || !solutionDescription.trim() || !githubUrl.trim()) {
      setErrorMsg('Please fill all mandatory fields: Title, Problem, Solution, and GitHub URL.');
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
        presentationUrl: presentationUrl.trim() || undefined,
      };

      const res = await fetch(`/api/teams/${team.id}/project`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText = data?.message || 'Failed to submit project.';
        if (errorText.toLowerCase().includes('deadline')) {
          setIsDeadlinePassed(true);
        }
        if (errorText.toLowerCase().includes('closed by the admin')) {
          setIsSubmissionsOpen(false);
        }
        throw new Error(errorText);
      }

      setSuccessMsg('Project saved successfully! The jury panel can now evaluate your submission.');

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (e) {
        // silent
      }

      onProjectSubmitted(data.team);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!team) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div className="comic-card p-10 max-w-md mx-auto bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00]">
          <div className="w-16 h-16 border-2 border-white bg-black mx-auto flex items-center justify-center text-[#FF5F00] mb-5 shadow-[2px_2px_0px_#FF5F00]">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white font-subheading mb-3 uppercase">Authentication Required</h3>
          <p className="text-[13px] text-neutral-400 mb-8 font-body leading-relaxed">
            To submit or edit your project and upload your presentation slides (up to 10MB limit), please sign in with your Team ID or Leader Email.
          </p>
          <button
            onClick={onSwitchToTeamLogin}
            className="btn-comic-primary w-full justify-center text-xs"
          >
            Sign In to Team Pass
          </button>
        </div>
      </div>
    );
  }

  // STRICT LOCK GUARD: Block if Admin turned off submissions globally
  if (!isSubmissionsOpen) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="comic-card p-10 bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00]">
          <div className="w-20 h-20 border-3 border-black bg-black mx-auto flex items-center justify-center text-[#FF5F00] mb-5 shadow-[4px_4px_0px_#FF5F00]">
            <Lock className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-white bg-black text-[#FF5F00] text-xs font-mono font-bold mb-4 shadow-[2px_2px_0px_#FFFFFF]">
            PORTAL LOCKED: SUBMISSIONS CLOSED
          </div>
          <h3 className="text-3xl font-bold text-white font-subheading mb-3 uppercase">
            Project Submissions Are Locked
          </h3>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed font-body">
            The 24-hour project submission window is currently disabled by the DSC Conveners.
          </p>
          <div className="bg-neutral-900 border-2 border-white p-5 text-center font-mono text-xs font-bold text-neutral-300">
            Submissions will open when enabled by the hackathon conveners. Please stay tuned to live broadcast updates!
          </div>
        </div>
      </div>
    );
  }

  // STRICT LOCK GUARD: Block if Admin hasn't verified team
  if (team.paymentStatus !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="comic-card p-10 bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00]">
          <div className="w-20 h-20 border-3 border-black bg-black mx-auto flex items-center justify-center text-[#FF5F00] mb-5 shadow-[4px_4px_0px_#FF5F00]">
            <Lock className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-white bg-black text-[#FF5F00] text-xs font-mono font-bold mb-4 shadow-[2px_2px_0px_#FFFFFF]">
            PORTAL STATUS: LOCKED BY ADMIN
          </div>
          <h3 className="text-3xl font-bold text-white font-subheading mb-3 uppercase">
            Project Submission Locked
          </h3>
          <p className="text-neutral-400 text-[13px] mb-6 leading-relaxed font-body">
            Team <span className="text-white font-bold">{team.teamName}</span> ({team.id}) is currently awaiting transaction review by the conveners.
          </p>
          <div className="bg-neutral-900 border-2 border-white p-5 text-left font-mono text-xs space-y-3 mb-6">
            <div className="flex items-center gap-2 text-neutral-300 font-bold">
              <CheckCircle className="w-4 h-4 text-[#FF5F00]" />
              <span>Registration saved to Neon Database</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-300 font-bold">
              <CheckCircle className="w-4 h-4 text-[#FF5F00]" />
              <span>Payment proof uploaded to Imagekit</span>
            </div>
            <div className="flex items-center gap-2 text-[#FF5F00] font-extrabold">
              <Lock className="w-4 h-4" />
              <span>Awaiting payment clearance to release pass & submission</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 font-mono font-bold uppercase">
            Project submission will unlock automatically after transaction verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-white bg-black text-[#FF5F00] text-xs font-mono font-bold mb-4 shadow-[3px_3px_0px_#FFFFFF]">
          <Code className="w-3.5 h-3.5" />
          <span>PROJECT PORTAL • ACTIVE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight comic-title">
          Submit Your Hackathon Project
        </h2>
        <p className="text-neutral-300 text-sm mt-3 font-mono font-bold uppercase">
          Submitting for <span className="text-[#FF5F00]">{team.teamName}</span> ({team.id}) • Track: <span className="text-white bg-neutral-900 px-2 py-0.5 border border-neutral-700">{track}</span>
        </p>
      </div>

      {/* Live Submission Countdown Timer */}
      <div className={`mb-8 p-5 sm:p-6 rounded-2xl border transition-all ${
        isDeadlinePassed
          ? 'bg-rose-950/20 border-rose-500/30 shadow-lg shadow-rose-950/20'
          : !isSubmissionsOpen
          ? 'bg-amber-950/20 border-amber-500/30 shadow-lg shadow-amber-950/20'
          : 'bg-[#111114] border-emerald-500/30 shadow-lg shadow-emerald-950/20'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isDeadlinePassed
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : !isSubmissionsOpen
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Submission Window
                </span>
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${
                  isDeadlinePassed
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : !isSubmissionsOpen
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse'
                }`}>
                  {isDeadlinePassed
                    ? 'DEADLINE PASSED • CLOSED'
                    : !isSubmissionsOpen
                    ? 'PAUSED BY ADMIN'
                    : 'LIVE COUNTDOWN'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {isDeadlinePassed
                  ? 'The submission deadline has officially ended. Late submissions are strictly rejected.'
                  : !isSubmissionsOpen
                  ? 'Submissions are currently paused by hackathon organizers.'
                  : 'Submissions strictly lock at 11:00 AM Code Freeze.'}
              </p>
            </div>
          </div>

          {/* Time Digits Card */}
          <div className="flex items-center gap-2">
            {timeLeft.days > 0 && (
              <>
                <div className="bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-center min-w-[58px]">
                  <div className="text-xl font-mono font-bold text-white leading-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-zinc-400 uppercase font-mono">Days</div>
                </div>
                <span className="text-zinc-600 font-mono font-bold text-lg">:</span>
              </>
            )}
            <div className="bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-mono font-bold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-zinc-400 uppercase font-mono">Hours</div>
            </div>
            <span className="text-zinc-600 font-mono font-bold text-lg">:</span>
            <div className="bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-mono font-bold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-zinc-400 uppercase font-mono">Mins</div>
            </div>
            <span className="text-zinc-600 font-mono font-bold text-lg">:</span>
            <div className="bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-mono font-bold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-emerald-400'}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-zinc-400 uppercase font-mono">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 border-3 border-black bg-red-950/80 text-red-300 text-xs flex items-center gap-3 font-mono font-bold shadow-[3px_3px_0px_#000]">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 border-3 border-black bg-neutral-900 text-emerald-400 text-xs flex items-center gap-3 font-mono font-bold shadow-[3px_3px_0px_#FF5F00]">
          <CheckCircle className="w-5 h-5 shrink-0 text-[#FF5F00]" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Section 1: Project Overview */}
        <div className="comic-card p-6 sm:p-8 bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00] space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-dashed border-neutral-800 text-white font-subheading font-bold text-lg uppercase">
            <Layers className="w-5 h-5 text-[#FF5F00]" />
            <h3>1. Project Concept & Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Project Title <span className="text-[#FF5F00]">*</span>
              </label>
              <input
                id="submit-input-title"
                type="text"
                required
                placeholder="e.g. NeuroVision AI, ZeroFraud Gateway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full comic-input font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Catchy Tagline
              </label>
              <input
                id="submit-input-tagline"
                type="text"
                placeholder="e.g. Real-time UPI transaction interceptor."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full comic-input font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Problem Statement <span className="text-[#FF5F00]">*</span>
            </label>
            <textarea
              id="submit-input-problem"
              required
              rows={3}
              placeholder="What problem does your project solve?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full comic-input font-bold font-body resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Proposed Solution <span className="text-[#FF5F00]">*</span>
            </label>
            <textarea
              id="submit-input-solution"
              required
              rows={3}
              placeholder="Describe your technical architecture and solution."
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              className="w-full comic-input font-bold font-body resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2">
              Target Track
            </label>
            <select
              id="submit-select-track"
              value={track}
              onChange={(e) => setTrack(e.target.value as TrackType)}
              className="w-full comic-input font-bold bg-black text-white"
            >
              {HACKATHON_TRACKS.map((t, idx) => (
                <option key={idx} value={t.name} className="bg-black text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Tech Stack Tags */}
        <div className="comic-card p-6 sm:p-8 bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-neutral-800">
            <div className="flex items-center gap-2.5 text-white font-subheading font-bold text-lg uppercase">
              <Code className="w-5 h-5 text-[#FF5F00]" />
              <h3>2. Technologies Used</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF5F00]">{techStack.length} SELECTED</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_TECH_STACK.map((tag) => {
              const isSelected = techStack.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTechTag(tag)}
                  className={`px-3 py-1.5 border-2 transition-all duration-150 cursor-pointer text-xs font-bold uppercase font-mono ${
                    isSelected
                      ? 'bg-[#FF5F00] text-black border-black shadow-[2px_2px_0px_#FFFFFF]'
                      : 'bg-black text-neutral-400 border-neutral-800 hover:text-white hover:border-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="text"
              placeholder="Add other tech..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleAddCustomTag}
              className="flex-1 comic-input font-bold text-xs"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="btn-comic-outline py-2.5 px-5 text-xs"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Deliverable Links & PPT Upload */}
        <div className="comic-card p-6 sm:p-8 bg-[#0D0E12] border-3 border-white shadow-[6px_6px_0px_#FF5F00] space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b-2 border-dashed border-neutral-800 text-white font-subheading font-bold text-lg uppercase">
            <Globe className="w-5 h-5 text-[#FF5F00]" />
            <h3>3. Project Deliverables (PPT/PDF Max 10MB)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Github className="w-4 h-4 text-neutral-400" />
                GitHub Repository URL <span className="text-[#FF5F00]">*</span>
              </label>
              <input
                id="submit-input-github"
                type="url"
                required
                placeholder="https://github.com/your-team/origin-hack"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full comic-input font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-neutral-400" />
                Live Demo URL (Optional)
              </label>
              <input
                id="submit-input-deployment"
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full comic-input font-bold font-mono"
              />
            </div>
          </div>

          {/* Presentation Slide Upload (strict 10MB enforcement) */}
          <div className="p-5 bg-black border-2 border-white rounded-none space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-mono font-bold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#FF5F00]" />
                Upload Presentation Slide Deck (PPT / PDF)
              </label>
              <span className="text-[9px] font-mono text-black font-extrabold bg-[#FF5F00] px-2 py-0.5 border border-black uppercase tracking-wider">
                10MB Limit
              </span>
            </div>

            <div className="relative border-3 border-dashed border-neutral-700 hover:border-[#FF5F00] p-6 text-center cursor-pointer transition-colors bg-[#0D0E12] shadow-[3px_3px_0px_#000]">
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto text-neutral-500 mb-2" />
              <span className="text-xs text-neutral-300 font-bold block">
                {isUploadingDoc
                  ? 'Uploading slide deck...'
                  : presentationFileName
                  ? presentationFileName
                  : 'Drag & Drop PDF/PPT Slides (Strict 10MB Limit)'}
              </span>
            </div>

            {presentationUrl && (
              <div className="flex items-center justify-between p-3 bg-neutral-900 border-2 border-white text-xs font-mono font-bold">
                <span className="text-[#FF5F00] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> PPT/PDF Linked successfully
                </span>
                <a
                  href={presentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white hover:text-[#FF5F00] underline"
                >
                  View Slides &rarr;
                </a>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 mb-1.5 uppercase">
                Or paste direct Canva / Google Slides URL:
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="w-full comic-input font-bold font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex flex-col items-center justify-center pt-2 gap-3">
          {isDeadlinePassed && (
            <p className="text-xs text-rose-400 font-mono font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Submissions are closed. The hackathon deadline has officially passed.</span>
            </p>
          )}
          {!isDeadlinePassed && !isSubmissionsOpen && (
            <p className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Submissions are temporarily paused by hackathon organizers.</span>
            </p>
          )}
          <button
            id="submit-btn-save-project"
            type="submit"
            disabled={isSubmitting || isUploadingDoc || !isSubmissionsOpen || isDeadlinePassed}
            className={`w-full sm:w-auto min-w-[320px] justify-center text-sm py-4 transition-all duration-200 ${
              isDeadlinePassed || !isSubmissionsOpen
                ? 'bg-zinc-800 text-zinc-500 border-3 border-neutral-900 cursor-not-allowed opacity-50 shadow-none'
                : 'btn-comic-primary'
            }`}
          >
            {isSubmitting ? (
              <span>Saving Deliverables...</span>
            ) : isDeadlinePassed ? (
              <>
                <Lock className="w-5 h-5 text-zinc-500" />
                <span>Submissions Closed (Deadline Passed)</span>
              </>
            ) : !isSubmissionsOpen ? (
              <>
                <Lock className="w-5 h-5 text-zinc-500" />
                <span>Submissions Disabled by Admin</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-black" />
                <span>{existingProject ? 'Update Submission' : 'Submit 24-Hour Project'}</span>
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
};
