import {
  getAllTeams as getStoredTeams,
  findTeamById as findStoredTeamById,
  saveTeam as saveTeamRecord,
  updateTeam as updateTeamRecord,
  deleteTeam as deleteTeamRecord,
  isTransactionRefUsed as isTransactionRefAlreadyUsed,
  getRegistrationStatus as getStoredRegistrationStatus,
  getSubmissionStatus as getStoredSubmissionStatus,
  setRegistrationStatus as setStoredRegistrationStatus,
  setSubmissionStatus as setStoredSubmissionStatus,
  getPaginatedTeams,
} from '../config/database.js';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../config/redis.js';
import { Team } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export interface TeamQueryOptions {
  page: number;
  limit: number;
  search: string;
  status: string;
  track: string;
  hasProject?: boolean;
  scored?: 'all' | 'true' | 'false';
}

export async function getTeamsPaginated(options: TeamQueryOptions) {
  return getPaginatedTeams(options);
}

export async function getAllTeams(): Promise<Team[]> {
  const cached = await getCachedData<Team[]>(CACHE_KEYS.TEAMS);
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  const teams = await getStoredTeams();
  await setCachedData(CACHE_KEYS.TEAMS, teams);
  return teams;
}

export async function findTeamByIdentifier(identifier: string): Promise<Team | null> {
  const clean = identifier.trim().toLowerCase();
  const teams = await getAllTeams();
  return teams.find(
    (t) =>
      t.id.toLowerCase() === clean ||
      t.leader.email.toLowerCase() === clean ||
      t.member2?.email?.toLowerCase() === clean ||
      t.member3?.email?.toLowerCase() === clean ||
      t.member4?.email?.toLowerCase() === clean ||
      t.member5?.email?.toLowerCase() === clean
  ) || null;
}

export async function findTeamById(id: string): Promise<Team | null> {
  return findStoredTeamById(id);
}

export async function saveTeam(team: Team): Promise<Team> {
  const saved = await saveTeamRecord(team);
  await invalidateCache(CACHE_KEYS.TEAMS);
  logger.info({ teamId: team.id }, 'Team saved');
  return saved;
}

export async function updateTeam(team: Team): Promise<Team> {
  const updated = await updateTeamRecord(team);
  await invalidateCache(CACHE_KEYS.TEAMS);
  return updated;
}

export async function deleteTeam(id: string): Promise<void> {
  await deleteTeamRecord(id);
  await invalidateCache(CACHE_KEYS.TEAMS);
}

export async function isTransactionRefUsed(ref: string): Promise<boolean> {
  return isTransactionRefAlreadyUsed(ref);
}

export async function getRegistrationStatus(): Promise<boolean> {
  return getStoredRegistrationStatus();
}

export async function getSubmissionStatus(): Promise<boolean> {
  return getStoredSubmissionStatus();
}

export async function setRegistrationStatus(isOpen: boolean): Promise<void> {
  await setStoredRegistrationStatus(isOpen);
  await invalidateCache(CACHE_KEYS.REGISTRATION_STATUS);
}

export async function setSubmissionStatus(isOpen: boolean): Promise<void> {
  await setStoredSubmissionStatus(isOpen);
  await invalidateCache(CACHE_KEYS.SUBMISSION_STATUS);
}