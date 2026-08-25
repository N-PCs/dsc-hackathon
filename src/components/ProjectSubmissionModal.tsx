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
} from 'lucide-react';
import { Team, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';
import { uploadDirectToImagekit } from '../lib/imagekitClient';

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

  // Submitting states
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check backend submission gate status on load
  React.useEffect(() => {
    fetch('/api/admin/submissions-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsSubmissionsOpen(data.submissionsOpen);
        }
      })
      .catch(() => {});
  }, []);

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
        throw new Error(data.message || 'Failed to submit project.');
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-white/10 mx-auto flex items-center justify-center text-emerald-400 mb-4">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-white mb-2">Team Authentication Required</h3>
        <p className="text-sm text-zinc-400 mb-6">
          To submit or edit your project and upload your presentation slides (up to 10MB limit), please sign in with your Team ID or Leader Email.
        </p>
        <button
          onClick={onSwitchToTeamLogin}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-md cursor-pointer"
        >
          Sign In to Team Workspace
        </button>
      </div>
    );
  }

  // STRICT LOCK GUARD: Block if Admin turned off submissions globally
  if (!isSubmissionsOpen) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 mx-auto flex items-center justify-center text-rose-400 mb-5 shadow-xl shadow-rose-500/10">
          <Lock className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono mb-3">
          <span>PORTAL STATUS: SUBMISSIONS CLOSED BY ORGANIZERS</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">
          Project Submissions Are Currently Locked
        </h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          The 24-hour project submission window is currently disabled by the DSC Executive Panel.
        </p>
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 text-center max-w-md mx-auto space-y-2 mb-6">
          <p className="text-xs text-zinc-300 font-medium">
            Submissions will open when enabled by the hackathon conveners. Please stay tuned to live broadcast updates!
          </p>
        </div>
      </div>
    );
  }

  // STRICT LOCK GUARD: Block if Admin hasn't verified team
  if (team.paymentStatus !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 mx-auto flex items-center justify-center text-amber-400 mb-5 shadow-xl shadow-amber-500/10">
          <Lock className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
          <span>PORTAL STATUS: LOCKED BY ADMIN</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-2">
          Project Submission Locked
        </h3>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Team <span className="text-white font-bold">{team.teamName}</span> ({team.id}) is currently <span className="text-amber-400 font-semibold font-mono">pending_verification</span> by the ORIGIN Admin Panel.
        </p>
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Registration details saved to Neon DB</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Payment screenshot uploaded to Imagekit</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Awaiting Admin Payment Release to unlock Project Portal & Pass</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Once an administrator verifies your payment, project submissions and PPT uploads (up to 10MB limit) will unlock automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
          <Code className="w-3.5 h-3.5" />
          <span>PROJECT SUBMISSION PORTAL • UNLOCKED BY ADMIN</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          Submit Your Hackathon Project
        </h2>
        <p className="text-zinc-400 text-sm mt-2 max-w-xl mx-auto">
          Submitting for <span className="text-white font-bold">{team.teamName}</span> ({team.id}) • Track: <span className="text-emerald-400 font-semibold">{track}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Project Overview */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-white font-serif font-bold text-base">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3>1. Project Concept & Overview</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Project Title <span className="text-emerald-400">*</span>
              </label>
              <input
                id="submit-input-title"
                type="text"
                required
                placeholder="e.g. NeuroVision AI, ZeroFraud Gateway"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Catchy Tagline
              </label>
              <input
                id="submit-input-tagline"
                type="text"
                placeholder="e.g. Real-time UPI transaction interceptor."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Problem Statement <span className="text-emerald-400">*</span>
            </label>
            <textarea
              id="submit-input-problem"
              required
              rows={3}
              placeholder="What problem does your project solve?"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Proposed Solution <span className="text-emerald-400">*</span>
            </label>
            <textarea
              id="submit-input-solution"
              required
              rows={3}
              placeholder="Describe your technical architecture and solution."
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Target Track
            </label>
            <select
              id="submit-select-track"
              value={track}
              onChange={(e) => setTrack(e.target.value as TrackType)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              {HACKATHON_TRACKS.map((t, idx) => (
                <option key={idx} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 2: Tech Stack Tags */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5 text-white font-serif font-bold text-base">
              <Code className="w-5 h-5 text-emerald-400" />
              <h3>2. Technologies Used</h3>
            </div>
            <span className="text-xs text-zinc-400">{techStack.length} selected</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_TECH_STACK.map((tag) => {
              const isSelected = techStack.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTechTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm shadow-emerald-500/20'
                      : 'bg-[#18181b] text-zinc-300 border border-white/10 hover:bg-[#222227]'
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
              className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-zinc-500"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 bg-[#18181b] hover:bg-[#222227] border border-white/10 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Links & PPT/PDF Upload (Imagekit 10MB Limit) */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-white font-serif font-bold text-base">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3>3. Code & Presentation Deliverables (PPT/PDF up to 10MB Limit)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-zinc-400" />
                GitHub Repository URL <span className="text-emerald-400">*</span>
              </label>
              <input
                id="submit-input-github"
                type="url"
                required
                placeholder="https://github.com/your-team/origin-hack"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Live Demo URL (Optional)
              </label>
              <input
                id="submit-input-deployment"
                type="url"
                placeholder="https://your-demo.vercel.app"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Imagekit PPT/PDF File Upload Field */}
          <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Upload Presentation Slide Deck (PPT / PPTX / PDF)
              </label>
              <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                MAX SIZE: 10MB
              </span>
            </div>

            <div className="relative border border-dashed border-white/20 hover:border-emerald-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#111114]">
              <input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 mx-auto text-emerald-400 mb-1.5" />
              <span className="text-xs text-zinc-300 font-medium block">
                {isUploadingDoc
                  ? 'Uploading document to Imagekit...'
                  : presentationFileName
                  ? presentationFileName
                  : 'Click or Drag PDF/PPT Deck (Strict 10MB Limit)'}
              </span>
            </div>

            {presentationUrl && (
              <div className="flex items-center justify-between p-2.5 bg-[#111114] rounded-lg border border-emerald-500/30 text-xs">
                <span className="text-emerald-400 font-mono flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Imagekit Document Attached
                </span>
                <a
                  href={presentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Preview Slide Deck &rarr;
                </a>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Or paste direct Google Slides / Canva Presentation link:
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="w-full bg-[#111114] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center pt-2">
          <button
            id="submit-btn-save-project"
            type="submit"
            disabled={isSubmitting || isUploadingDoc}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Deliverables...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{existingProject ? 'Update Project Deliverables' : 'Submit 24-Hour Project'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
