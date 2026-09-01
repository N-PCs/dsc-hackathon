import { getAllTeams } from '../src/config/database.js';

async function check() {
  const teams = await getAllTeams();
  console.log(`📊 Total teams in database: ${teams.length}`);
  console.log('Team names:');
  teams.forEach(t => console.log(`  - ${t.teamName} (${t.id})`));
}
check();