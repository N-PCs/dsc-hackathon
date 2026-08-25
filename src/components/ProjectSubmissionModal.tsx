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
} from 'lucide-react';
import { Team, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';

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

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'File upload failed');
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
        throw new Error(data.message || 'Failed to submit project.');
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

        {/* Submit */}
        <div className="flex justify-center pt-2">
          <button
            id="submit-btn-save-project"
            type="submit"
            disabled={isSubmitting || isUploadingDoc}
            className="w-full sm:w-auto min-w-[320px] btn-comic-primary justify-center text-sm py-4"
          >
            {isSubmitting ? (
              <span>Saving Deliverables...</span>
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
