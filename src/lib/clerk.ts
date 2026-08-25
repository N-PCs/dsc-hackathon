// Clerk Authentication Helper & Email Domain Rules

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';



/**
 * Validates whether an email belongs to the official student domain (@vitbhopal.ac.in)
 */
export function isVITBhopalEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith('@vitbhopal.ac.in');
}


