export const DEFAULT_SUBMISSION_DEADLINE = '2026-09-05T12:00:00+05:30';

export function getSubmissionDeadline(): string {
  return process.env.SUBMISSION_DEADLINE || DEFAULT_SUBMISSION_DEADLINE;
}

export function isDeadlinePassed(deadlineStr?: string): boolean {
  const deadline = deadlineStr ? new Date(deadlineStr) : new Date(getSubmissionDeadline());
  if (isNaN(deadline.getTime())) return Date.now() >= new Date(DEFAULT_SUBMISSION_DEADLINE).getTime();
  return Date.now() >= deadline.getTime();
}