export const DEFAULT_SUBMISSION_DEADLINE = '2026-09-02 T12:00:00+05:30';

export function getSubmissionDeadline(): string {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.SUBMISSION_DEADLINE) {
      return process.env.SUBMISSION_DEADLINE;
    }
  } catch (e) {
    // Browser fallback
  }
  return DEFAULT_SUBMISSION_DEADLINE;
}

export function isDeadlinePassed(deadlineStr?: string): boolean {
  try {
    const deadline = deadlineStr ? new Date(deadlineStr) : new Date(getSubmissionDeadline());
    if (isNaN(deadline.getTime())) {
      return Date.now() >= new Date(DEFAULT_SUBMISSION_DEADLINE).getTime();
    }
    return Date.now() >= deadline.getTime();
  } catch (e) {
    return false;
  }
}
