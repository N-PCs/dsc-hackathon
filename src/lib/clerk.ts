// Clerk Authentication Helper & Email Domain Rules

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export const DEFAULT_ADMIN_EMAILS = [
  'neelpandeyofficial@gmail.com',
  'neel.24bce10303@vitbhopal.ac.in',
  'aarush.25bcy10047@vitbhopal.ac.in',
  'sanskar.24bce11374@vitbhopal.ac.in',
  'nikhil.25bai11440@vitbhopal.ac.in',
  'shresth.24bsa10161@vitbhopal.ac.in',
  'tanishka.25bce10056@vitbhopal.ac.in',
  'ritik.24bce11502@vitbhopal.ac.in',
  'varun.25bce10360@vitbhopal.ac.in',
  'rajnarayan.24bec10089@vitbhopal.ac.in',
  'anish.25mim10055@vitbhopal.ac.in',
  'ananya.24bai10039@vitbhopal.ac.in',
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
