import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Team, ProjectSubmission } from './types.js';

// Cryptographically secure secret key
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'origin-hackathon-sec-key-2026-vit-bhopal-defense';
const JURY_PASSCODE = process.env.JURY_PASSCODE || 'JURY2026';

export interface TokenPayload {
  role: 'admin' | 'jury' | 'team';
  sub: string; // email or teamId
  teamId?: string;
  email?: string;
  adminRole?: string;
  iat?: number;
  exp?: number;
}

/**
 * Sign an admin JWT token (valid for 24 hours)
 */
export function signAdminToken(email: string, adminRole = 'Admin'): string {
  return jwt.sign(
    { role: 'admin', sub: email.toLowerCase(), email: email.toLowerCase(), adminRole },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Sign a jury JWT token (valid for 24 hours)
 */
export function signJuryToken(email: string): string {
  return jwt.sign(
    { role: 'jury', sub: email.toLowerCase(), email: email.toLowerCase() },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Sign a team JWT token (valid for 7 days)
 */
export function signTeamToken(teamId: string, email: string): string {
  return jwt.sign(
    { role: 'team', sub: teamId.toUpperCase(), teamId: teamId.toUpperCase(), email: email.toLowerCase() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Verify and decode any token signed by our secret
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
    return jwt.verify(cleanToken, JWT_SECRET) as TokenPayload;
  } catch (err: any) {
    return null;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validate jury credentials securely
 */
export function verifyJuryCredentials(email: string, passcode: string): boolean {
  if (!email || !passcode) return false;
  const cleanEmail = email.trim().toLowerCase();
  const allowed = process.env.JURY_ALLOWED_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [
    'jury.chair@origin.org',
  ];
  if (!allowed.includes(cleanEmail)) return false;
  return timingSafeEqual(passcode.trim(), JURY_PASSCODE);
}

/**
 * Sanitizes team data for public display (e.g. public ticket viewing)
 * Strips sensitive PII: phone numbers, student registration numbers, mess names,
 * payment proof images, transaction reference IDs, and access codes.
 */
export function sanitizeTeamPublic(team: Team): Partial<Team> {
  return {
    id: team.id,
    teamName: team.teamName,
    track: team.track,
    paymentStatus: team.paymentStatus,
    checkedInVenue: team.checkedInVenue,
    ticketIssued: team.ticketIssued,
    leader: {
      name: team.leader.name,
      email: team.leader.email,
      role: team.leader.role,
      college: team.leader.college,
      phone: '', // Redacted
      registrationNumber: '', // Redacted
      messName: '', // Redacted
      residentialStatus: team.leader.residentialStatus,
    },
    member2: team.member2 ? {
      name: team.member2.name,
      email: team.member2.email,
      role: team.member2.role,
      college: team.member2.college,
      phone: '', // Redacted
      registrationNumber: '', // Redacted
      messName: '', // Redacted
      residentialStatus: team.member2.residentialStatus,
    } : undefined,
    member3: team.member3 ? {
      name: team.member3.name,
      email: team.member3.email,
      role: team.member3.role,
      college: team.member3.college,
      phone: '', // Redacted
      registrationNumber: '', // Redacted
      messName: '', // Redacted
      residentialStatus: team.member3.residentialStatus,
    } : undefined,
    member4: team.member4 ? {
      name: team.member4.name,
      email: team.member4.email,
      role: team.member4.role,
      college: team.member4.college,
      phone: '', // Redacted
      registrationNumber: '', // Redacted
      messName: '', // Redacted
      residentialStatus: team.member4.residentialStatus,
    } : undefined,
    member5: team.member5 ? {
      name: team.member5.name,
      email: team.member5.email,
      role: team.member5.role,
      college: team.member5.college,
      phone: '', // Redacted
      registrationNumber: '', // Redacted
      messName: '', // Redacted
      residentialStatus: team.member5.residentialStatus,
    } : undefined,
    project: team.project ? {
      title: team.project.title,
      tagline: team.project.tagline,
      problemStatement: team.project.problemStatement,
      solutionDescription: team.project.solutionDescription,
      track: team.project.track,
      techStack: team.project.techStack,
      githubUrl: team.project.githubUrl,
      submittedAt: team.project.submittedAt,
    } : undefined,
  };
}

/**
 * Sanitizes team data for jury review
 * Includes project details, but excludes payment proof and private access codes.
 */
export function sanitizeTeamForJury(team: Team): Partial<Team> {
  const publicData = sanitizeTeamPublic(team);
  return {
    ...publicData,
    project: team.project, // Full project details for grading
  };
}
