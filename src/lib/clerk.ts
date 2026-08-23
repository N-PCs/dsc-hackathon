// Clerk Authentication Helper & Email Domain Rules

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const DEFAULT_ADMIN_EMAILS = [
  'neelpandeyofficial@gmail.com',
  'dsc.vitbhopal@gmail.com',
  'admin@vitbhopal.ac.in',
  'lead.origin@vitbhopal.ac.in',
  'faculty.advisor@vitbhopal.ac.in',
  'jury.chair@origin.org',
];

/**
 * Validates whether an email belongs to the official student domain (@vitbhopal.ac.in)
 */
export function isVITBhopalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@vitbhopal.ac.in');
}

/**
 * Validates if an email is an authorized Admin or Jury member
 */
export function isAdminEmail(email: string, extraAdmins: string[] = []): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  const allAdmins = [...DEFAULT_ADMIN_EMAILS, ...extraAdmins].map((e) => e.trim().toLowerCase());
  return allAdmins.includes(clean);
}
