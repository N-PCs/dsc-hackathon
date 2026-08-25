import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  CheckCircle,
  Clock,
  Eye,
  Github,
  Globe,
  FileText,
  Radio,
  Layers,
  KeyRound,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Filter,
  ExternalLink,
  Users,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Team, TrackType } from '../types';
import { HACKATHON_TRACKS } from '../data/mockData';

interface JuryPortalProps {
  teams: Team[];
  onScoreProject: (
    teamId: string,
    score: {
      innovation: number;
      technicalComplexity: number;
      uiUx: number;
      presentation: number;
      impact: number;
      feedback: string;
    }
  ) => void;
  onRefreshData: () => void;
}

export const JuryPortal: React.FC<JuryPortalProps> = ({
  teams,
  onScoreProject,
  onRefreshData,
}) => {
  // Jury Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('origin_jury_auth') === 'true';
  });
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'evaluated' | 'pending'>('all');

  // Selected Team for Details Modal & Scoring Modal
  const [selectedDetailTeam, setSelectedDetailTeam] = useState<Team | null>(null);
  const [selectedScoringTeam, setSelectedScoringTeam] = useState<Team | null>(null);

  // Scoring Form State
  const [scores, setScores] = useState({
    innovation: 15,
    technicalComplexity: 15,
    uiUx: 15,
    presentation: 15,
    impact: 15,
    feedback: '',
  });

  // Default Jury Passcode
  const JURY_PASSCODE = 'JURY2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCodeInput.trim().toUpperCase() === JURY_PASSCODE) {
      setIsAuthenticated(true);
      localStorage.setItem('origin_jury_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Jury Access Code. Please contact the lead organiser.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('origin_jury_auth');
  };

  // Sync scores when opening scoring modal
  useEffect(() => {
    if (selectedScoringTeam?.project?.score) {
      const s = selectedScoringTeam.project.score;
      setScores({
        innovation: s.innovation ?? 15,
        technicalComplexity: s.technicalComplexity ?? 15,
        uiUx: s.uiUx ?? 15,
        presentation: s.presentation ?? 15,
        impact: s.impact ?? 15,
        feedback: s.feedback ?? '',
      });
    } else {
      setScores({
        innovation: 15,
        technicalComplexity: 15,
        uiUx: 15,
        presentation: 15,
        impact: 15,
        feedback: '',
      });
    }
  }, [selectedScoringTeam]);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScoringTeam) return;

    onScoreProject(selectedScoringTeam.id, scores);
    setSelectedScoringTeam(null);
  };

  // Only consider teams that have submitted a project
  const submittedTeams = teams.filter((t) => !!t.project);

  // Filtered teams
  const filteredTeams = submittedTeams.filter((team) => {
    const proj = team.project;
    if (!proj) return false;

    const matchesTrack = selectedTrack === 'all' || team.track === selectedTrack;
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.techStack.some((ts) => ts.toLowerCase().includes(searchTerm.toLowerCase()));

    const isEvaluated = !!proj.score && proj.score.total > 0;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'evaluated' && isEvaluated) ||
      (statusFilter === 'pending' && !isEvaluated);

    return matchesTrack && matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalSubmissions = submittedTeams.length;
  const evaluatedCount = submittedTeams.filter((t) => !!t.project?.score && (t.project?.score?.total ?? 0) > 0).length;
  const pendingCount = totalSubmissions - evaluatedCount;

  // Render Access Code Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111114] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-white tracking-tight">Jury Portal Access</h2>
            <p className="text-xs text-zinc-400">
              Enter your Jury Access Code to view project submission details and access evaluation rubrics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 font-mono mb-1.5 uppercase tracking-wider">
                Jury Access Code
              </label>
              <input
                type="password"
                placeholder="Enter Access Code"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-600 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Verify & Enter Jury Portal
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#111114] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-white">Jury Evaluation Portal</h1>
              <span className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-mono font-semibold">
                Official Jury Access
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review project submission details, inspect code & demos, and record rubric scores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-zinc-300 flex items-center gap-2 cursor-pointer transition-colors"
            title="Refresh Submissions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit Portal
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Total Submissions
            </span>
            <span className="text-2xl font-bold font-mono text-white">{totalSubmissions}</span>
          </div>
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Evaluated Projects
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{evaluatedCount}</span>
          </div>
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111114] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Pending Evaluation
            </span>
            <span className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#111114] border border-white/10 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by project title, team name, or tech stack..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-2">
            {(['all', 'evaluated', 'pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Track Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-colors ${
              selectedTrack === 'all'
                ? 'bg-white/20 text-white font-bold'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            All Tracks
          </button>
          {HACKATHON_TRACKS.map((t) => (
            <button
              key={t.name}
              onClick={() => setSelectedTrack(t.name)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap cursor-pointer transition-colors ${
                selectedTrack === t.name
                  ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300 font-bold'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white font-serif flex items-center gap-2">
          <span>Submitted Projects ({filteredTeams.length})</span>
        </h2>

        {filteredTeams.length === 0 ? (
          <div className="bg-[#111114] border border-white/10 rounded-3xl p-12 text-center text-zinc-500 space-y-2">
            <Layers className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-medium">No project submissions match your filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => {
              const proj = team.project!;
              const hasScore = !!proj.score && proj.score.total > 0;

              return (
                <div
                  key={team.id}
                  className="bg-[#111114] border border-white/10 hover:border-blue-500/30 rounded-3xl p-6 space-y-4 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {team.track}
                        </span>
                        <h3 className="text-lg font-bold text-white font-serif mt-1">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-1">{proj.tagline}</p>
                      </div>

                      {hasScore ? (
                        <div className="text-right">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-bold">
                            Score: {proj.score?.total}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Team & Member info */}
                    <div className="text-xs text-zinc-400 flex items-center gap-3 pt-1">
                      <span className="font-semibold text-white">Team: {team.teamName}</span>
                      <span>•</span>
                      <span>Leader: {team.leader.name}</span>
                    </div>

                    {/* Tech Stack Pills */}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/5 border border-white/10 text-zinc-300 px-2 py-0.5 rounded-lg"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Links row */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-xs text-zinc-400">
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-blue-400"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Code
                        </a>
                      )}
                      {proj.deploymentUrl && (
                        <a
                          href={proj.deploymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-emerald-400"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      )}
                      {proj.videoUrl && (
                        <a
                          href={proj.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white flex items-center gap-1 text-purple-400"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          Video
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setSelectedDetailTeam(team)}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <button
                      onClick={() => setSelectedScoringTeam(team)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {hasScore ? 'Edit Score' : 'Evaluate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POPUP 1: FULL SUBMISSION DETAILS MODAL */}
      {selectedDetailTeam && selectedDetailTeam.project && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-white/10 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                  {selectedDetailTeam.track}
                </span>
                <h3 className="text-xl font-bold text-white font-serif mt-2">
                  {selectedDetailTeam.project.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Submitted by Team <span className="text-white font-semibold">{selectedDetailTeam.teamName}</span> ({selectedDetailTeam.id})
                </p>
              </div>
              <button
                onClick={() => setSelectedDetailTeam(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-white/5 rounded-lg cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Tagline */}
            <div>
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Tagline / Summary</h4>
              <p className="text-sm text-zinc-200 bg-white/5 p-3 rounded-xl border border-white/5">
                {selectedDetailTeam.project.tagline}
              </p>
            </div>

            {/* Problem Statement */}
            <div>
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Problem Statement</h4>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#18181b] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                {selectedDetailTeam.project.problemStatement}
              </p>
            </div>

            {/* Solution Description */}
            <div>
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">Solution Description</h4>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#18181b] p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                {selectedDetailTeam.project.solutionDescription}
              </p>
            </div>

            {/* Tech Stack */}
            {selectedDetailTeam.project.techStack && (
              <div>
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDetailTeam.project.techStack.map((tech, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-lg">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links Grid */}
            <div>
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Submission Artifact Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDetailTeam.project.githubUrl && (
                  <a
                    href={selectedDetailTeam.project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-xs text-blue-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Github className="w-4 h-4" /> GitHub Repository
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.deploymentUrl && (
                  <a
                    href={selectedDetailTeam.project.deploymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-xs text-emerald-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Globe className="w-4 h-4" /> Live Product Demo
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.presentationUrl && (
                  <a
                    href={selectedDetailTeam.project.presentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-xs text-amber-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <FileText className="w-4 h-4" /> Presentation Deck
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedDetailTeam.project.videoUrl && (
                  <a
                    href={selectedDetailTeam.project.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-between text-xs text-purple-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Radio className="w-4 h-4" /> Video Pitch
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Team Roster */}
            <div>
              <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Team Members</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-zinc-400 font-mono text-[10px] block">Leader</span>
                  <span className="font-semibold text-white">{selectedDetailTeam.leader.name}</span> ({selectedDetailTeam.leader.email})
                </div>
                {selectedDetailTeam.member2?.name && (
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-zinc-400 font-mono text-[10px] block">Member 2</span>
                    <span className="font-semibold text-white">{selectedDetailTeam.member2.name}</span>
                  </div>
                )}
                {selectedDetailTeam.member3?.name && (
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-zinc-400 font-mono text-[10px] block">Member 3</span>
                    <span className="font-semibold text-white">{selectedDetailTeam.member3.name}</span>
                  </div>
                )}
                {selectedDetailTeam.member4?.name && (
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-zinc-400 font-mono text-[10px] block">Member 4</span>
                    <span className="font-semibold text-white">{selectedDetailTeam.member4.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const teamToScore = selectedDetailTeam;
                  setSelectedDetailTeam(null);
                  setSelectedScoringTeam(teamToScore);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg"
              >
                Evaluate & Score Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: JURY RUBRIC SCORING MODAL */}
      {selectedScoringTeam && selectedScoringTeam.project && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h4 className="text-base font-serif font-bold text-white">Jury Rubric Scorecard</h4>
                <p className="text-xs text-zinc-400">
                  {selectedScoringTeam.project.title} • {selectedScoringTeam.teamName}
                </p>
              </div>
              <button
                onClick={() => setSelectedScoringTeam(null)}
                className="text-zinc-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Innovation & Concept (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.innovation}
                    onChange={(e) => setScores({ ...scores, innovation: Number(e.target.value) })}
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Technical Depth (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.technicalComplexity}
                    onChange={(e) => setScores({ ...scores, technicalComplexity: Number(e.target.value) })}
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    UI/UX & Execution (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.uiUx}
                    onChange={(e) => setScores({ ...scores, uiUx: Number(e.target.value) })}
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    Presentation & Pitch (/20)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={scores.presentation}
                    onChange={(e) => setScores({ ...scores, presentation: Number(e.target.value) })}
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Practical Impact & Feasibility (/20)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={scores.impact}
                  onChange={(e) => setScores({ ...scores, impact: Number(e.target.value) })}
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300">Total Calculated Rubric Score:</span>
                <span className="text-base font-bold font-mono text-blue-400">
                  {scores.innovation + scores.technicalComplexity + scores.uiUx + scores.presentation + scores.impact} / 100
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  Jury Feedback & Remarks
                </label>
                <textarea
                  rows={3}
                  value={scores.feedback}
                  onChange={(e) => setScores({ ...scores, feedback: e.target.value })}
                  placeholder="Provide constructive feedback for the team..."
                  className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2.5 text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScoringTeam(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save & Record Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
