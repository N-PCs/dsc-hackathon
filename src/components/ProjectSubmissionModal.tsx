import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Send,
  Github,
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
  X,
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
  const [videoUrl, setVideoUrl] = useState(existingProject?.videoUrl || '');

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

  const handleRemoveTag = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
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
      setSuccessMsg(`PPT/PDF document successfully uploaded to Imagekit! (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
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
        videoUrl: videoUrl.trim() || undefined,
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

      setSuccessMsg('Project details and 10MB presentation saved! Jury members can now evaluate your project.');

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
      <div className="max-w-xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-orange-500 mb-3">
            <Send className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider inline-block">
            AUTHENTICATION REQUIRED
          </span>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Team Authentication Required
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed font-mono">
            To submit or edit your project and upload your presentation slides (up to 10MB limit), please sign in with your Team ID or Leader Email.
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

  // STRICT LOCK GUARD: Block if Admin turned off submissions globally
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
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Project Submissions Are Currently Locked
          </h3>
          <p className="text-neutral-400 text-xs font-mono leading-relaxed max-w-md mx-auto">
            The 24-hour project submission window is currently disabled by the DSC Executive Panel.
          </p>
          <div className="bg-black border border-neutral-800 p-4 text-center max-w-md mx-auto space-y-1">
            <p className="text-xs text-neutral-300 font-mono">
              Submissions will open when enabled by the hackathon conveners. Please stay tuned to live broadcast updates!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // STRICT LOCK GUARD: Block if Admin hasn't verified team
  if (team.paymentStatus !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 sm:pt-32 pb-16 text-center">
        <div className="bg-black border border-neutral-800 p-8 sm:p-12 space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-black border border-neutral-800 mx-auto flex items-center justify-center text-amber-400 mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider">
            <span>PORTAL STATUS: LOCKED BY ADMIN</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Project Submission Locked
          </h3>
          <p className="text-neutral-400 text-xs font-mono leading-relaxed max-w-md mx-auto">
            Team <span className="text-white font-bold">{team.teamName}</span> ({team.id}) is currently <span className="text-amber-400 font-semibold font-mono">pending_verification</span> by the ORIGIN Admin Panel.
          </p>
          <div className="bg-black border border-neutral-800 p-5 text-left max-w-md mx-auto space-y-3 font-mono">
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-orange-400" />
              <span>Registration details saved to Neon DB</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-orange-400" />
              <span>Payment screenshot uploaded to Imagekit</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Awaiting Admin Payment Release to unlock Project Portal & Pass</span>
            </div>
          </div>
          <p className="text-[11px] font-mono text-neutral-500">
            Once an administrator verifies your payment, project submissions and PPT uploads (up to 10MB limit) will unlock automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-28 sm:pt-32 pb-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Code className="w-3.5 h-3.5" />
          <span>PROJECT SUBMISSION PORTAL • UNLOCKED BY ADMIN</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Submit Your Hackathon Project
        </h2>
        <p className="text-neutral-400 text-xs font-mono max-w-xl mx-auto">
          Submitting for <span className="text-white font-bold">{team.teamName}</span> ({team.id}) • Track: <span className="text-orange-400 font-semibold">{track}</span>
        </p>
      </div>

      {/* Live Submission Countdown Timer */}
      <div className={`p-6 border transition-all ${
        isDeadlinePassed
          ? 'bg-rose-950/20 border-rose-800/80 shadow-2xl'
          : !isSubmissionsOpen
          ? 'bg-amber-950/20 border-amber-800/80 shadow-2xl'
          : 'bg-black border-neutral-800 shadow-2xl'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className={`w-12 h-12 flex items-center justify-center shrink-0 border ${
              isDeadlinePassed
                ? 'bg-rose-950/40 text-rose-400 border-rose-800/80'
                : !isSubmissionsOpen
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
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
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : !isSubmissionsOpen
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-orange-500/20 border-orange-500/40 text-orange-300 animate-pulse'
                }`}>
                  {isDeadlinePassed
                    ? 'DEADLINE PASSED • CLOSED'
                    : !isSubmissionsOpen
                    ? 'PAUSED BY ADMIN'
                    : 'LIVE COUNTDOWN'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {isDeadlinePassed
                  ? 'The submission deadline has officially ended. Late submissions are strictly rejected.'
                  : !isSubmissionsOpen
                  ? 'Submissions are currently paused by hackathon organizers.'
                  : 'Submissions strictly lock at 11:00 AM Code Freeze.'}
              </p>
            </div>
          </div>

          {/* Time Digits Card */}
          <div className="flex items-center gap-2 font-mono">
            {timeLeft.days > 0 && (
              <>
                <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
                  <div className="text-xl font-extrabold text-white leading-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-neutral-500 uppercase">Days</div>
                </div>
                <span className="text-neutral-600 font-bold text-lg">:</span>
              </>
            )}
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-orange-500'}`}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase">Hours</div>
            </div>
            <span className="text-neutral-600 font-bold text-lg">:</span>
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-orange-500'}`}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-neutral-500 uppercase">Mins</div>
            </div>
            <span className="text-neutral-600 font-bold text-lg">:</span>
            <div className="bg-black border border-neutral-800 px-3.5 py-2 text-center min-w-[58px]">
              <div className={`text-xl font-extrabold leading-tight ${isDeadlinePassed ? 'text-rose-400' : 'text-orange-500'}`}>
                {String(timeLeft.seconds).padStart(2, '0')}
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

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1: Project Overview */}
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800 text-white font-bold text-base" style={{ fontFamily: 'var(--font-heading)' }}>
            <Layers className="w-5 h-5 text-orange-500" />
            <h3>1. Project Concept & Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5">
                Project Title <span className="text-orange-500">*</span>
              </label>
              <input
                id="submit-input-title"
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
                id="submit-input-tagline"
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
              id="submit-input-problem"
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
              id="submit-input-solution"
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
              Target Track
            </label>
            <select
              id="submit-select-track"
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

        {/* Section 2: Tech Stack Tags */}
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div className="flex items-center gap-2.5 text-white font-bold text-base" style={{ fontFamily: 'var(--font-heading)' }}>
              <Code className="w-5 h-5 text-orange-500" />
              <h3>2. Technologies Used</h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">{techStack.length} selected</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_TECH_STACK.map((tag) => {
              const isSelected = techStack.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTechTag(tag)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-orange-600 text-white font-bold border-orange-500'
                      : 'bg-black text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2">
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

        {/* Section 3: Links & PPT/PDF Upload (Imagekit 10MB Limit) */}
        <div className="bg-black border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-800 text-white font-bold text-base" style={{ fontFamily: 'var(--font-heading)' }}>
            <Globe className="w-5 h-5 text-orange-500" />
            <h3>3. Code & Presentation Deliverables (PPT/PDF up to 10MB Limit)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-neutral-500" />
                GitHub Repository URL <span className="text-orange-500">*</span>
              </label>
              <input
                id="submit-input-github"
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
                id="submit-input-deployment"
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-4 py-3 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Imagekit PPT/PDF File Upload Field */}
          <div className="p-5 bg-black border border-neutral-800 space-y-4 font-mono">
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-300 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                <FileText className="w-4 h-4 text-orange-500" />
                Upload Presentation Slide Deck (PPT / PPTX / PDF)
              </label>
              <span className="text-[10px] text-orange-400 px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 uppercase font-bold">
                MAX SIZE: 10MB
              </span>
            </div>

            <div className="relative border border-dashed border-neutral-800 hover:border-orange-500/60 p-6 text-center cursor-pointer transition-colors bg-black">
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto text-orange-500 mb-2" />
              <span className="text-xs text-neutral-300 font-mono block">
                {isUploadingDoc
                  ? 'Uploading document to Imagekit...'
                  : presentationFileName
                  ? presentationFileName
                  : 'Click or Drag PDF/PPT Deck (Strict 10MB Limit)'}
              </span>
            </div>

            {presentationUrl && (
              <div className="flex items-center justify-between p-3 bg-black border border-orange-500/30 text-xs">
                <span className="text-orange-400 font-mono flex items-center gap-1.5 font-bold">
                  <FileCheck className="w-4 h-4" /> Imagekit Document Attached
                </span>
                <a
                  href={presentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-400 hover:underline font-semibold"
                >
                  Preview Slide Deck &rarr;
                </a>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-neutral-500 mb-1 uppercase tracking-wider">
                Or paste direct Google Slides / Canva Presentation link:
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="w-full bg-black border border-neutral-800 focus:border-orange-500 px-3 py-2 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none transition-colors"
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
            className={`w-full sm:w-auto min-w-[280px] px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors border ${
              isDeadlinePassed || !isSubmissionsOpen
                ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-60'
                : 'bg-orange-600 hover:bg-orange-500 text-white border-orange-500 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <span>Saving Deliverables...</span>
            ) : isDeadlinePassed ? (
              <>
                <Lock className="w-4 h-4 text-neutral-500" />
                <span>Submissions Closed (Deadline Passed)</span>
              </>
            ) : !isSubmissionsOpen ? (
              <>
                <Lock className="w-4 h-4 text-neutral-500" />
                <span>Submissions Disabled by Admin</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{existingProject ? 'Update Project Deliverables' : 'Submit 24-Hour Project'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
