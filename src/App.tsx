import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RegistrationForm } from './components/RegistrationForm';
import { TeamPassTicket } from './components/TeamPassTicket';
import { ProjectSubmissionModal } from './components/ProjectSubmissionModal';
import { AdminPortal } from './components/AdminPortal';
import { HackathonScheduleRules } from './components/HackathonScheduleRules';
import { TeamLoginModal } from './components/TeamLoginModal';
import { LiveAnnouncementsBanner } from './components/LiveAnnouncementsBanner';
import { Team, Announcement, HackathonStats, TrackType, PaymentStatus } from './types';
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from './data/mockData';
import { Terminal, Heart, Sparkles, Shield, Ticket, Send, Clock, BookOpen } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin'>('home');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedTrackForReg, setSelectedTrackForReg] = useState<TrackType>('AI & Machine Learning');

  // Load active team from localStorage on initial mount
  useEffect(() => {
    try {
      const savedTeamId = localStorage.getItem('origin_active_team_id');
      if (savedTeamId) {
        const found = teams.find((t) => t.id === savedTeamId);
        if (found) {
          setActiveTeam(found);
        }
      } else if (teams.length > 0) {
        // Default to first team for instant preview capability
        setActiveTeam(teams[0]);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch teams & announcements from API on mount
  const fetchTeamsAndStats = async () => {
    try {
      const [teamsRes, annRes] = await Promise.all([
        fetch('/api/teams').then((r) => r.json()),
        fetch('/api/announcements').then((r) => r.json()),
      ]);

      if (teamsRes.success && teamsRes.teams) {
        setTeams(teamsRes.teams);
        if (activeTeam) {
          const updatedActive = teamsRes.teams.find((t: Team) => t.id === activeTeam.id);
          if (updatedActive) setActiveTeam(updatedActive);
        }
      }

      if (annRes.success && annRes.announcements) {
        setAnnouncements(annRes.announcements);
      }
    } catch (err) {
      console.warn('Using local in-memory dataset');
    }
  };

  useEffect(() => {
    fetchTeamsAndStats();
  }, []);

  // Calculate live statistics
  const stats: HackathonStats = React.useMemo(() => {
    const totalTeams = teams.length;
    const verifiedTeams = teams.filter((t) => t.paymentStatus === 'verified').length;
    const pendingTeams = teams.filter((t) => t.paymentStatus === 'pending').length;
    const submittedProjects = teams.filter((t) => !!t.project).length;
    const checkedInTeams = teams.filter((t) => t.checkedInVenue).length;

    let totalParticipants = 0;
    const trackCounts: Record<TrackType, number> = {
      'AI & Machine Learning': 0,
      'Web3 & Blockchain': 0,
      'FinTech & Cybersecurity': 0,
      'HealthTech & BioInformatics': 0,
      'Smart City & IoT': 0,
      'Open Innovation & Social Impact': 0,
    };

    teams.forEach((t) => {
      let count = 1;
      if (t.member2?.name) count++;
      if (t.member3?.name) count++;
      if (t.member4?.name) count++;
      totalParticipants += count;

      if (trackCounts[t.track] !== undefined) {
        trackCounts[t.track]++;
      }
    });

    return {
      totalTeams,
      verifiedTeams,
      pendingTeams,
      totalParticipants,
      submittedProjects,
      checkedInTeams,
      trackCounts,
    };
  }, [teams]);

  // Handler: When a new team registers successfully
  const handleRegistrationSuccess = (newTeam: Team) => {
    setTeams((prev) => [newTeam, ...prev.filter((t) => t.id !== newTeam.id)]);
    setActiveTeam(newTeam);
    localStorage.setItem('origin_active_team_id', newTeam.id);
    setActiveTab('team');
  };

  // Handler: When user submits or edits their 24-hour project
  const handleProjectSubmitted = (updatedTeam: Team) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setActiveTeam(updatedTeam);
  };

  // Handler: Admin updates a team status (payment, verification, checkin)
  const handleAdminUpdateTeamStatus = async (
    teamId: string,
    statusUpdate: {
      paymentStatus?: PaymentStatus;
      checkedInVenue?: boolean;
      ticketIssued?: boolean;
      notes?: string;
    }
  ) => {
    // Optimistic local update
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...statusUpdate } : t))
    );
    if (activeTeam?.id === teamId) {
      setActiveTeam((prev) => (prev ? { ...prev, ...statusUpdate } : null));
    }

    try {
      await fetch(`/api/teams/${teamId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusUpdate),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Admin scores a project
  const handleAdminScoreProject = async (
    teamId: string,
    scoreData: {
      innovation: number;
      technicalComplexity: number;
      uiUx: number;
      presentation: number;
      impact: number;
      feedback: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
      const data = await res.json();
      if (data.success && data.team) {
        setTeams((prev) => prev.map((t) => (t.id === teamId ? data.team : t)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Admin deletes a team
  const handleAdminDeleteTeam = async (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (activeTeam?.id === teamId) {
      setActiveTeam(null);
      localStorage.removeItem('origin_active_team_id');
    }
    try {
      await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Admin sends broadcast announcement
  const handleAdminSendAnnouncement = async (
    title: string,
    message: string,
    category: 'urgent' | 'schedule' | 'food' | 'mentorship' | 'general'
  ) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, category }),
      });
      const data = await res.json();
      if (data.success && data.announcement) {
        setAnnouncements((prev) => [data.announcement, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Live Announcement Ticker */}
      <LiveAnnouncementsBanner announcements={announcements} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registeredTeamCount={teams.length}
        hasActiveTeam={!!activeTeam}
        isAdmin={activeTab === 'admin'}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection
              stats={stats}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectTrack={(track) => setSelectedTrackForReg(track)}
            />
            <HackathonScheduleRules />
          </>
        )}

        {activeTab === 'register' && (
          <RegistrationForm
            selectedTrack={selectedTrackForReg}
            onRegisteredSuccess={handleRegistrationSuccess}
            onSwitchToLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'team' && (
          <TeamPassTicket
            team={activeTeam}
            onNavigateToSubmit={() => setActiveTab('submit')}
            onSwitchTeamLogin={() => setIsLoginModalOpen(true)}
            onRefreshTeamData={fetchTeamsAndStats}
          />
        )}

        {activeTab === 'submit' && (
          <ProjectSubmissionModal
            team={activeTeam}
            onProjectSubmitted={handleProjectSubmitted}
            onSwitchToTeamLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'schedule' && <HackathonScheduleRules />}

        {activeTab === 'admin' && (
          <AdminPortal
            teams={teams}
            announcements={announcements}
            onUpdateTeamStatus={handleAdminUpdateTeamStatus}
            onScoreProject={handleAdminScoreProject}
            onDeleteTeam={handleAdminDeleteTeam}
            onSendAnnouncement={handleAdminSendAnnouncement}
            onRefreshData={fetchTeamsAndStats}
          />
        )}
      </main>

      {/* Team Login / Look Up Modal */}
      <TeamLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(team) => {
          setActiveTeam(team);
          localStorage.setItem('origin_active_team_id', team.id);
          setActiveTab('team');
        }}
        onNavigateToRegister={() => {
          setActiveTab('register');
        }}
      />

      {/* Global Footer */}
      <footer className="border-t border-white/10 bg-[#0c0c0e] py-10 mt-16 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-white tracking-wider">
                ORIGIN '26 OVERNIGHT HACKATHON
              </span>
              <p className="text-[11px] text-zinc-400">
                Organized by Data Science Club • VIT Bhopal University
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium text-zinc-400">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Timeline & Rules
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Register Team
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Digital ID Pass
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Submit 24H Project
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-emerald-400 text-emerald-400/90 transition-colors flex items-center gap-1 font-mono font-bold cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Console
            </button>
          </div>

          <div className="text-[11px] text-zinc-400 text-center md:text-right font-mono">
            <span>24-Hour Code Freeze Protocol Active</span>
            <div className="text-zinc-500">All submissions verified by DSC Jury</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
