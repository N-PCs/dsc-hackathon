import { getAllTeams } from './teamService.js';
import { TrackType } from '../utils/types.js';

export async function getHackathonStats() {
  const teams = await getAllTeams();
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
    if (trackCounts[t.track] !== undefined) trackCounts[t.track]++;
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
}