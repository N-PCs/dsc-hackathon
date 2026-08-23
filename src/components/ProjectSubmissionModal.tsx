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
  Bot,
  Flame,
  Award,
  ExternalLink,
  Plus,
  X,
  HelpCircle,
} from 'lucide-react';
import { Team, ProjectSubmission, TrackType } from '../types';
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
  'Gemini API',
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
  // Form fields initialized with existing submission if present
  const existingProject = team?.project;

  const [title, setTitle] = useState(existingProject?.title || '');
  const [tagline, setTagline] = useState(existingProject?.tagline || '');
  const [problemStatement, setProblemStatement] = useState(existingProject?.problemStatement || '');
  const [solutionDescription, setSolutionDescription] = useState(existingProject?.solutionDescription || '');
  const [track, setTrack] = useState<TrackType>(existingProject?.track || team?.track || 'AI & Machine Learning');
  const [techStack, setTechStack] = useState<string[]>(
    existingProject?.techStack || ['React', 'TypeScript', 'FastAPI', 'Gemini API']
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [githubUrl, setGithubUrl] = useState(existingProject?.githubUrl || '');
  const [deploymentUrl, setDeploymentUrl] = useState(existingProject?.deploymentUrl || '');
  const [presentationUrl, setPresentationUrl] = useState(existingProject?.presentationUrl || '');
  const [videoUrl, setVideoUrl] = useState(existingProject?.videoUrl || '');

  // Submitting state & AI Coach state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);

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

  // Run AI Pitch Coach & Judge Review
  const handleRunAiEvaluation = async () => {
    if (!title.trim() || !problemStatement.trim()) {
      setErrorMsg('Please enter at least a Project Title and Problem Statement to run AI Pitch Coach.');
      return;
    }

    setIsAnalyzingAI(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/pitch-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          problemStatement,
          solutionDescription,
          track,
          techStack,
        }),
      });

      const data = await res.json();
      if (data.success && data.feedback) {
        setAiFeedback(data.feedback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAI(false);
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

      setSuccessMsg('Project details saved successfully! Judges can now review your deliverables.');

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
          To submit or edit your 24-hour hackathon project, please select or look up your registered team using your Team ID or Leader Email.
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-3">
          <Code className="w-3.5 h-3.5" />
          <span>PHASE 2: 24-HOUR PROJECT DELIVERABLES</span>
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
            <h3>1. Project Concept & Problem Space</h3>
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
                Catchy Tagline (One-Liner)
              </label>
              <input
                id="submit-input-tagline"
                type="text"
                placeholder="e.g. Real-time UPI interceptor with heuristic packet checks."
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
              placeholder="What real-world pain point or market gap does your project address? (e.g. 3M patients suffer delayed retinopathy diagnoses...)"
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Proposed Solution & Innovation <span className="text-emerald-400">*</span>
            </label>
            <textarea
              id="submit-input-solution"
              required
              rows={3}
              placeholder="Describe your technical solution, algorithm/architecture choices, and what makes it unique."
              value={solutionDescription}
              onChange={(e) => setSolutionDescription(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none placeholder-zinc-500"
            />
          </div>

          {/* Track selection override */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Target Track / Domain
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
              <h3>2. Technologies & Tools Used</h3>
            </div>
            <span className="text-xs text-zinc-400">{techStack.length} selected</span>
          </div>

          {/* Quick Select common tags */}
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

          {/* Custom tag input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add other tools/libraries (e.g. Scikit-learn, WebAssembly)..."
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

          {/* Selected tags chip bar */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {techStack.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#18181b] text-emerald-300 border border-emerald-500/20 text-xs font-mono"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-400 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Links & Deliverables */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 text-white font-serif font-bold text-base">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3>3. Code & Deliverables Links</h3>
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
                placeholder="https://github.com/your-team/origin-hack-project"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" />
                Live Deployment URL (Optional but recommended)
              </label>
              <input
                id="submit-input-deployment"
                type="url"
                placeholder="https://your-project.vercel.app"
                value={deploymentUrl}
                onChange={(e) => setDeploymentUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono placeholder-zinc-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                Presentation Deck PPT / PDF Link (Google Slides, Canva, PDF)
              </label>
              <input
                id="submit-input-presentation"
                type="url"
                placeholder="https://docs.google.com/presentation/d/..."
                value={presentationUrl}
                onChange={(e) => setPresentationUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-zinc-400" />
                Demo Video Walkthrough URL (YouTube, Loom, Drive)
              </label>
              <input
                id="submit-input-video"
                type="url"
                placeholder="https://youtube.com/watch?v=... or Loom"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono placeholder-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* AI Pitch Coach & Judge Rubric Assistant */}
        <div className="bg-[#111114] border border-white/10 p-5 sm:p-7 rounded-2xl shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-white">
                  Gemini AI Project Coach & Jury Simulator
                </h4>
                <p className="text-xs text-zinc-400">
                  Instant AI feedback on your pitch deck clarity, rubric strengths & predicted jury questions.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAiEvaluation}
              disabled={isAnalyzingAI}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnalyzingAI ? 'Evaluating Pitch...' : 'Run AI Coach Review'}</span>
            </button>
          </div>

          {aiFeedback && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-[#18181b] border border-white/10 rounded-xl">
                <div className="text-center px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <span className="text-xs text-emerald-400 font-mono block">EST. SCORE</span>
                  <span className="text-xl font-extrabold text-emerald-300 font-mono">
                    {aiFeedback.scoreEstimate}/100
                  </span>
                </div>
                <div className="text-xs text-zinc-300">
                  <span className="font-bold text-white block mb-0.5">30-Second Elevator Pitch:</span>
                  <p className="italic text-zinc-300">"{aiFeedback.elevatorPitch}"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#18181b] rounded-xl border border-white/10">
                  <span className="font-bold text-emerald-400 block mb-2">Key Strengths:</span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {aiFeedback.strengths?.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#18181b] rounded-xl border border-white/10">
                  <span className="font-bold text-amber-400 block mb-2">Jury Questions to Prepare For:</span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300">
                    {aiFeedback.juryQuestions?.map((q: string, idx: number) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-center pt-2">
          <button
            id="submit-btn-save-project"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[280px] px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving Project Submission...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{existingProject ? 'Update Project Submission' : 'Submit 24-Hour Project'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
