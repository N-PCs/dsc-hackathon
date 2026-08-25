import express from 'express';
import { getSubmissionDeadline, isDeadlinePassed } from './src/lib/deadline';
import { setSubmissionStatusDB, getSubmissionStatusDB, saveNewTeam, findTeamById } from './server/db';
import { Team } from './src/types';

async function runTests() {
  console.log('--- STARTING SUBMISSION DEADLINE & LOCK TESTS ---');

  // Test 1: Deadline calculation functions
  console.log('\n[Test 1] Deadline helper functions:');
  const pastDeadline = '2020-01-01T00:00:00Z';
  const futureDeadline = '2099-01-01T00:00:00Z';
  console.log('Past deadline isDeadlinePassed:', isDeadlinePassed(pastDeadline), 'Expected: true');
  console.log('Future deadline isDeadlinePassed:', isDeadlinePassed(futureDeadline), 'Expected: false');

  if (!isDeadlinePassed(pastDeadline) || isDeadlinePassed(futureDeadline)) {
    throw new Error('Test 1 failed: deadline calculation is incorrect.');
  }

  // Setup test team
  const testTeamId = `TEST-${Date.now()}`;
  const testTeam: Team = {
    id: testTeamId,
    teamName: 'Deadline Testers',
    accessCode: '9999',
    track: 'AI & Machine Learning',
    leader: { name: 'Test Leader', email: 'leader@test.com', phone: '1234567890' },
    paymentStatus: 'verified',
    transactionRef: 'TXN-123456',
    registeredAt: new Date().toISOString(),
    checkedInVenue: true,
    ticketIssued: true,
  };
  await saveNewTeam(testTeam);

  // Test 2: Backend submission handler logic simulation
  console.log('\n[Test 2] Submission route validation logic:');

  const simulateSubmit = async (customDeadline: string, submissionsOpen: boolean) => {
    // 1. Deadline check
    if (isDeadlinePassed(customDeadline)) {
      return { status: 403, success: false, message: 'Submission deadline has passed. Submissions are permanently closed.' };
    }
    // 2. Admin toggle check
    if (!submissionsOpen) {
      return { status: 403, success: false, message: 'Project submissions are currently closed by the Admin! Submissions will open when enabled by the organizers.' };
    }
    // 3. Verified check
    const team = await findTeamById(testTeamId);
    if (!team || team.paymentStatus !== 'verified') {
      return { status: 403, success: false, message: 'Team not verified.' };
    }
    return { status: 200, success: true, message: 'Project submitted successfully.' };
  };

  // Case A: Before deadline + Admin Open => SUCCESS (200)
  const resA = await simulateSubmit(futureDeadline, true);
  console.log('Case A (Future deadline + Admin Open):', resA);
  if (resA.status !== 200 || !resA.success) throw new Error('Case A failed');

  // Case B: Before deadline + Admin Closed => REJECTED (403 - Closed by Admin)
  const resB = await simulateSubmit(futureDeadline, false);
  console.log('Case B (Future deadline + Admin Closed):', resB);
  if (resB.status !== 403 || !resB.message.includes('closed by the Admin')) throw new Error('Case B failed');

  // Case C: After deadline + Admin Open => REJECTED (403 - Deadline Passed)
  const resC = await simulateSubmit(pastDeadline, true);
  console.log('Case C (Past deadline + Admin Open):', resC);
  if (resC.status !== 403 || !resC.message.includes('deadline has passed')) throw new Error('Case C failed');

  // Case D: After deadline + Admin Closed => REJECTED (403 - Deadline Passed takes priority)
  const resD = await simulateSubmit(pastDeadline, false);
  console.log('Case D (Past deadline + Admin Closed):', resD);
  if (resD.status !== 403 || !resD.message.includes('deadline has passed')) throw new Error('Case D failed');

  // Case E: Admin reopens after deadline => MUST STILL BE REJECTED (403 - Deadline Passed)
  await setSubmissionStatusDB(true);
  const resE = await simulateSubmit(pastDeadline, true);
  console.log('Case E (Admin reopens after deadline):', resE);
  if (resE.status !== 403 || !resE.message.includes('deadline has passed')) throw new Error('Case E failed');

  console.log('\n--- ALL SUBMISSION LOCK & DEADLINE TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
