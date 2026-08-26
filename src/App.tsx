import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { RegistrationForm } from './components/RegistrationForm';
import { TeamPassTicket } from './components/TeamPassTicket';
import { ProjectSubmissionModal } from './components/ProjectSubmissionModal';
import { AdminPortal } from './components/AdminPortal';
import { JuryPortal } from './components/JuryPortal';
import { HackathonScheduleRules } from './components/HackathonScheduleRules';
import { TeamLoginModal } from './components/TeamLoginModal';
import { LiveAnnouncementsBanner } from './components/LiveAnnouncementsBanner';
import { SponsorsSection } from './components/SponsorsSection';
import { FAQSection } from './components/FAQSection';
import { BackgroundVeins } from './components/BackgroundVeins';
import { Team, Announcement, HackathonStats, TrackType, PaymentStatus } from './types';
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from './data/mockData';
import { ArrowRight } from 'lucide-react';

import { useUser } from '@clerk/clerk-react';
import { isVITBhopalEmail } from './lib/clerk';

export default function App() {
  const { user, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<
    'home' | 'register' | 'team' | 'submit' | 'schedule' | 'admin' | 'jury' | 'faq'
  >('home');
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedTrackForReg, setSelectedTrackForReg] = useState<TrackType>('AI & Machine Learning');

  const hasActiveAnnouncement = announcements.length > 0 && !bannerDismissed;

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Sync Clerk authenticated user
  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      const email = user.primaryEmailAddress.emailAddress.toLowerCase();


      const matchedTeam = teams.find(
        (t) =>
          t.leader.email.toLowerCase() === email ||
          t.member2?.email?.toLowerCase() === email ||
          t.member3?.email?.toLowerCase() === email ||
          t.member4?.email?.toLowerCase() === email ||
          t.member5?.email?.toLowerCase() === email
      );
      if (matchedTeam) {
        setActiveTeam(matchedTeam);
        localStorage.setItem('origin_active_team_id', matchedTeam.id);
      }
    }
  }, [isSignedIn, user, teams]);

  // Load active team from localStorage
  useEffect(() => {
    (window as any).setActiveTabGlobal = setActiveTab;
    try {
      const savedTeamId = localStorage.getItem('origin_active_team_id');
      if (savedTeamId && teams.length > 0) {
        const found = teams.find((t) => t.id === savedTeamId);
        if (found) {
          setActiveTeam(found);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [teams]);

  // Fetch teams & announcements from API
  const fetchTeamsAndStats = async () => {
    try {
      const safeJson = async (res: Response) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const txt = await res.text();
          throw new Error(`Invalid JSON response: ${txt.slice(0, 100)}`);
        }
        return res.json();
      };
      const [teamsRes, annRes] = await Promise.all([
        fetch('/api/teams').then(safeJson),
        fetch('/api/announcements').then(safeJson),
      ]);

      if (teamsRes.success && Array.isArray(teamsRes.teams)) {
        setTeams((prev) => {
          // If the backend returns valid teams, or if we have no prior state, update
          if (teamsRes.teams.length > 0 || prev.length === 0) {
            return teamsRes.teams;
          }
          // Prevent wiping existing UI state on transient backend hiccups
          return prev;
        });

        if (activeTeam && teamsRes.teams.length > 0) {
          const updatedActive = teamsRes.teams.find((t: Team) => t.id === activeTeam.id);
          if (updatedActive) setActiveTeam(updatedActive);
        }
      }

      if (annRes.success && Array.isArray(annRes.announcements)) {
        setAnnouncements((prev) => {
          if (annRes.announcements.length > 0 || prev.length === 0) {
            return annRes.announcements;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn('[Data Sync] Background polling failed, preserving current view state.');
    }
  };

  // Periodic polling so all admin consoles stay synced in real-time with backend/database
  useEffect(() => {
    fetchTeamsAndStats();
    const interval = setInterval(() => {
      fetchTeamsAndStats();
    }, 5000);
    return () => clearInterval(interval);
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
      if (t.member5?.name) count++;
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

  const handleRegistrationSuccess = (newTeam: Team) => {
    setTeams((prev) => [newTeam, ...prev.filter((t) => t.id !== newTeam.id)]);
    setActiveTeam(newTeam);
    localStorage.setItem('origin_active_team_id', newTeam.id);
    setActiveTab('team');
  };

  const handleProjectSubmitted = (updatedTeam: Team) => {
    setTeams((prev) => prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)));
    setActiveTeam(updatedTeam);
  };

  const getAdminHeaders = () => {
    try {
      const saved = localStorage.getItem('origin_active_admin');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          return { 'x-admin-email': parsed.email };
        }
      }
    } catch (e) {}
    return {};
  };

  const handleAdminUpdateTeamStatus = async (
    teamId: string,
    statusUpdate: {
      paymentStatus?: PaymentStatus;
      checkedInVenue?: boolean;
      ticketIssued?: boolean;
      notes?: string;
    }
  ) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...statusUpdate } : t))
    );
    if (activeTeam?.id === teamId) {
      setActiveTeam((prev) => (prev ? { ...prev, ...statusUpdate } : null));
    }

    try {
      await fetch(`/api/teams/${teamId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
        body: JSON.stringify(statusUpdate),
      });
    } catch (e) {
      console.error(e);
    }
  };

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
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
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

  const handleAdminDeleteTeam = async (teamId: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (activeTeam?.id === teamId) {
      setActiveTeam(null);
      localStorage.removeItem('origin_active_team_id');
    }
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: { ...getAdminHeaders() },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminSendAnnouncement = async (
    title: string,
    message: string,
    category: 'urgent' | 'schedule' | 'food' | 'mentorship' | 'general'
  ) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminHeaders() },
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

  const handleAdminDeleteAnnouncement = async (announcementId: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    try {
      await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { ...getAdminHeaders() },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Scroll to top on tab change for dedicated sub-views
  useEffect(() => {
    if (activeTab !== 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      {/* Background Veins Canvas */}
      <BackgroundVeins />

      {/* Announcements */}
      <LiveAnnouncementsBanner
        announcements={announcements}
        onDismiss={() => setBannerDismissed(true)}
      />

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registeredTeamCount={teams.length}
        hasActiveTeam={!!activeTeam}
        isAdmin={activeTab === 'admin'}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        hasAnnouncement={hasActiveAnnouncement}
      />

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${hasActiveAnnouncement ? 'pt-10' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && (
              <>
                <HeroSection
                  stats={stats}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSelectTrack={(track) => setSelectedTrackForReg(track)}
                />
                <HackathonScheduleRules />
                <FAQSection />
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

            {activeTab === 'schedule' && (
              <>
                <div className="pt-16" />
                <HackathonScheduleRules />
                <SponsorsSection />
              </>
            )}

            {activeTab === 'faq' && (
              <>
                <div className="pt-16" />
                <FAQSection />
              </>
            )}

            {activeTab === 'admin' && (
              <AdminPortal
                teams={teams}
                announcements={announcements}
                onUpdateTeamStatus={handleAdminUpdateTeamStatus}
                onScoreProject={handleAdminScoreProject}
                onDeleteTeam={handleAdminDeleteTeam}
                onSendAnnouncement={handleAdminSendAnnouncement}
                onDeleteAnnouncement={handleAdminDeleteAnnouncement}
                onRefreshData={fetchTeamsAndStats}
              />
            )}

            {activeTab === 'jury' && (
              <JuryPortal
                teams={teams}
                onScoreProject={handleAdminScoreProject}
                onRefreshData={fetchTeamsAndStats}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Team Login Modal */}
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

      {/* Comic Book Torn Paper Edge Divider before Footer */}
      <div className="torn-paper-edge" />

      {/* Global Footer */}
      <footer className="bg-[#0A0A0A] border-t border-[#222222] py-16 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Logo + Desc */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/DSClogo.png"
                  alt="Data Science Club Logo"
                  className="h-10 w-auto object-contain"
                />
                <img
                  src="/origin-logo.png"
                  alt="ORIGIN Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="text-xs text-neutral-400 font-sans leading-relaxed max-w-xs">
                The flagship 18-hour overnight hackathon organized by the
                Data Science Club at VIT Bhopal University.
              </p>
            </div>

            {/* Quick links */}
            <div className="md:col-span-2">
              <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-4 font-bold">
                EVENT
              </span>
              <div className="space-y-3">
                {[
                  { label: 'OVERVIEW', tab: 'home' as const },
                  { label: 'SCHEDULE', tab: 'schedule' as const },
                  { label: 'FAQ', tab: 'faq' as const },
                ].map((link) => (
                  <button
                    key={link.tab}
                    onClick={() => setActiveTab(link.tab)}
                    className="block font-heading text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-4 font-bold">
                PARTICIPATE
              </span>
              <div className="space-y-3">
                {[
                  { label: 'REGISTER TEAM', tab: 'register' as const },
                  { label: 'DIGITAL ID PASS', tab: 'team' as const },
                  { label: 'SUBMIT PROJECT', tab: 'submit' as const },
                ].map((link) => (
                  <button
                    key={link.tab}
                    onClick={() => setActiveTab(link.tab)}
                    className="block font-heading text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="md:col-span-4">
              <span className="font-heading text-xs text-neutral-400 uppercase tracking-widest block mb-4 font-bold">
                READY TO BUILD?
              </span>
              <button
                onClick={() => setActiveTab('register')}
                className="btn-primary text-xs mb-6"
              >
                REGISTER TEAM NOW &gt;
              </button>
              <div className="space-y-2 font-heading text-xs text-neutral-500 uppercase tracking-wider">
                <p>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    ORGANISER PORTAL ACCESS &gt;
                  </button>
                </p>
                <p>
                  <button
                    onClick={() => setActiveTab('jury')}
                    className="hover:text-[#FF3B00] cursor-pointer transition-colors"
                  >
                    JURY EVALUATION PORTAL &gt;
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 font-heading text-xs text-neutral-500 uppercase tracking-wider">
            <span>
              © 2026 DATA SCIENCE CLUB, VIT BHOPAL UNIVERSITY
            </span>
            <span className="text-[#FF3B00]">
              18H CODE FREEZE PROTOCOL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
