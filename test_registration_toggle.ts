import 'dotenv/config';
import {
  initDatabase,
  getRegistrationStatusDB,
  setRegistrationStatusDB,
  saveNewTeam,
  getAllTeams,
  findTeamById,
  deleteTeamById,
} from './server/db';
import { Team } from './src/types';

async function runTests() {
  console.log('=== STARTING REGISTRATION TOGGLE & NEON DB TESTS ===');

  // 1. Initialize Database
  await initDatabase();
  console.log('[Test 1] DB Initialized.');

  // 2. Test initial registration status
  const initialStatus = await getRegistrationStatusDB();
  console.log('[Test 2] Initial registration status:', initialStatus);

  // 3. Test toggling OFF
  console.log('[Test 3] Toggling registrations OFF...');
  await setRegistrationStatusDB(false);
  const statusOff = await getRegistrationStatusDB();
  console.log('Status after setting false:', statusOff, 'Expected: false');
  if (statusOff !== false) {
    throw new Error('Failed to set registration status to false');
  }

  // 4. Test toggling ON
  console.log('[Test 4] Toggling registrations ON...');
  await setRegistrationStatusDB(true);
  const statusOn = await getRegistrationStatusDB();
  console.log('Status after setting true:', statusOn, 'Expected: true');
  if (statusOn !== true) {
    throw new Error('Failed to set registration status to true');
  }

  // 5. Test saving a new team to Neon DB
  const testId = `ORIGIN-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const testTeam: Team = {
    id: testId,
    teamName: 'Neon Sync Test Team',
    accessCode: '1234',
    track: 'AI & Machine Learning',
    leader: {
      name: 'Sync Test Leader',
      email: `syncleader_${Date.now()}@vitbhopal.ac.in`,
      phone: '9999988888',
      college: 'VIT Bhopal University',
    },
    paymentStatus: 'pending',
    transactionRef: `UTR-TEST-${Date.now()}`,
    registeredAt: new Date().toLocaleString('en-US'),
    checkedInVenue: false,
    ticketIssued: false,
  };

  console.log(`[Test 5] Saving test team ${testId} to Neon DB...`);
  await saveNewTeam(testTeam);

  // 6. Verify team is readable from Neon DB via getAllTeams & findTeamById
  const allTeams = await getAllTeams();
  console.log(`[Test 6] Total teams in DB: ${allTeams.length}`);
  const found = await findTeamById(testId);
  if (!found) {
    throw new Error(`Failed to retrieve newly registered team ${testId} from DB!`);
  }
  console.log(`Found registered team in DB: ${found.teamName} (${found.id})`);

  // Clean up test team
  await deleteTeamById(testId);
  console.log(`[Test 7] Cleanup: Deleted test team ${testId}.`);

  console.log('\n=== ALL REGISTRATION TOGGLE & NEON DB TESTS PASSED! ===');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
