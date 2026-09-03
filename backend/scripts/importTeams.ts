import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { saveTeam, findTeamByIdentifier } from '../src/services/teamService.js';
import { Team, TeamMember } from '../src/utils/types.js';

// Helper: Extract UTR – ensures uniqueness
function extractUTR(paymentStr: string, teamId: string): string {
  if (!paymentStr) return `TXN-${teamId}-${Date.now()}`;
  const match = paymentStr.match(/\b(\d{10,})\b/);
  if (match) {
    console.log(`   🔍 Extracted UTR: ${match[1]} from "${paymentStr.substring(0, 30)}..."`);
    return match[1];
  }
  const fallback = `TXN-${teamId}-${Date.now().toString().slice(-6)}`;
  console.log(`   ⚠️ No 10+ digit UTR found, using: "${fallback}"`);
  return fallback;
}

// Helper: Create a TeamMember object
function createMember(
  name: string,
  email: string,
  regNo: string,
  residentialStatus: string,
  messName: string,
  role: string = 'Member'
): TeamMember | undefined {
  if (!name || !email) {
    console.log(`   ⏭️ Skipping member (name or email missing): name="${name}", email="${email}"`);
    return undefined;
  }
  const member: TeamMember = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: '',
    registrationNumber: regNo?.trim() || '',
    residentialStatus: residentialStatus === 'Day Scholar' ? 'Day Scholar' : 'Hosteller',
    messName: messName?.trim() || 'Anchor (Boys)',
    college: 'VIT Bhopal University',
    role,
  };
  console.log(`   👤 Created ${role}: ${member.name} (${member.email})`);
  return member;
}

// Main import function
async function importTeams() {
  const csvFilePath = './scripts/data.csv';
  
  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ CSV file not found at: ${csvFilePath}`);
    return;
  }

  console.log(`📂 Reading CSV file: ${csvFilePath}`);
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    relax_column_count_less: true,
  });

  console.log(`📊 Total rows found: ${records.length}`);

  // ---- DEDUPLICATION: Keep the latest row per leader email ----
  const latestMap = new Map<string, any>();
  let duplicateCount = 0;

  for (const row of records) {
    const leaderEmail = row['Team Lead: Email ID']?.trim()?.toLowerCase();
    if (!leaderEmail) continue;
    const timestamp = row['Timestamp'] ? new Date(row['Timestamp']).getTime() : 0;
    const existing = latestMap.get(leaderEmail);
    if (existing) {
      duplicateCount++;
      const oldTimestamp = existing._timestamp || 0;
      if (timestamp > oldTimestamp) {
        // Newer entry replaces older one
        console.log(`   🔄 Duplicate found for ${leaderEmail}:`);
        console.log(`      ❌ Old: ${existing['Team Name']} (${existing['Timestamp']})`);
        console.log(`      ✅ New: ${row['Team Name']} (${row['Timestamp']}) → KEPT`);
        row._timestamp = timestamp;
        latestMap.set(leaderEmail, row);
      } else {
        console.log(`   ⏭️ Duplicate found for ${leaderEmail}:`);
        console.log(`      ✅ Old: ${existing['Team Name']} (${existing['Timestamp']}) → KEPT`);
        console.log(`      ❌ New: ${row['Team Name']} (${row['Timestamp']}) → DISCARDED`);
      }
    } else {
      row._timestamp = timestamp;
      latestMap.set(leaderEmail, row);
    }
  }

  const uniqueRows = Array.from(latestMap.values());
  console.log(`✅ Found ${uniqueRows.length} unique leader emails (${duplicateCount} duplicates removed).`);

  // ---- Import the deduplicated rows ----
  let successful = 0;
  let failed = 0;
  const failedRows: { rowNum: number; teamName: string; error: string }[] = [];

  for (let i = 0; i < uniqueRows.length; i++) {
    const row = uniqueRows[i];
    const rowNum = i + 1;
    const teamName = row['Team Name']?.trim() || '❌ No Team Name';

    console.log(`[Row ${rowNum}] ${teamName}`);

    if (!teamName) {
      console.log(`   ⏭️ Skipping: No Team Name`);
      continue;
    }

    try {
      // Generate Team ID and Access Code
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const teamId = `ORIGIN-${randomNum}`;
      const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`   🆔 Generated Team ID: ${teamId}, Access Code: ${accessCode}`);

      // --- Leader ---
      const leaderEmail = row['Team Lead: Email ID']?.trim()?.toLowerCase() || '';
      if (!leaderEmail) {
        console.log(`   ⏭️ Skipping: No Leader Email`);
        continue;
      }

      const leader: TeamMember = {
        name: row['Team Lead: Full Name']?.trim() || '',
        email: leaderEmail,
        phone: row['Team Lead: Contact Number (Phone)']?.trim() || '',
        registrationNumber: row['Team Lead: Registration Number']?.trim() || '',
        residentialStatus: row['Team Lead: Residential Status'] === 'Day Scholar' ? 'Day Scholar' : 'Hosteller',
        messName: row['Enter your mess name']?.trim() || 'Anchor (Boys)',
        college: 'VIT Bhopal University',
        role: 'Team Lead',
      };

      console.log(`   👤 Leader: ${leader.name} (${leader.email})`);

      // --- Members ---
      console.log(`   👥 Processing members:`);
      const member2 = createMember(
        row['Member 2: Full Name'],
        row['Member 2: Email ID'],
        row['Member 2: Registration Number'],
        row['Member 2: Residential Status'],
        row['Member 2 Mess Name:'],
        'Member 2'
      );
      const member3 = createMember(
        row['Member 3: Full Name'],
        row['Member 3: Email ID'],
        row['Member 3: Registration Number'],
        row['Member 3: Residential Status'],
        row['Member 3 Mess Name:'],
        'Member 3'
      );
      const member4 = createMember(
        row['Member 4: Full Name'],
        row['Member 4: Email ID'],
        row['Member 4: Registration Number'],
        row['Member 4: Residential Status'],
        row['Member 4 Mess Name:'],
        'Member 4'
      );
      const member5 = createMember(
        row['Member 5: Full Name'],
        row['Member 5: Email ID'],
        row['Member 5: Registration Number'],
        row['Member 5: Residential Status'],
        row['Member 5 Mess Name:'],
        'Member 5'
      );

      // --- Compute amountPaid ---
      const allMembers = [leader, member2, member3, member4, member5].filter(m => m && m.name);
      const amountPaid = allMembers.reduce((sum, m) => {
        return sum + (m.residentialStatus === 'Day Scholar' ? 219 : 100);
      }, 0);
      console.log(`   💰 Computed amountPaid: ₹${amountPaid} (${allMembers.length} members)`);

      // --- Transaction Reference ---
      const paymentColumn = row['Registration Fees - Payment Amount & Account Details (see note)'] || '';
      const transactionRef = extractUTR(paymentColumn, teamId);

      // --- 🔥 FIXED: Payment Proof URL (flexible key matching) ---
      const paymentProofKey = Object.keys(row).find(key =>
        key.startsWith('Please Upload the Screenshot')
      );
      const paymentProofUrl = paymentProofKey ? row[paymentProofKey]?.trim() || '' : '';
      console.log(`   📎 Payment Proof: ${paymentProofUrl ? 'Yes' : 'No'}`);

      // --- Registered At ---
      const timestamp = row['Timestamp'];
      let registeredAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      if (timestamp) {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) {
          registeredAt = d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
        }
      }
      console.log(`   🕒 Registered At: ${registeredAt}`);

      // Build Team object
      const team: Team = {
        id: teamId,
        teamName,
        accessCode,
        track: 'AI & Machine Learning',
        leader,
        member2,
        member3,
        member4,
        member5,
        paymentStatus: 'verified',
        paymentProofUrl,
        transactionRef,
        amountPaid,
        registeredAt,
        checkedInVenue: false,
        ticketIssued: true,
        project: undefined,
        notes: '',
      };

      // Check if already exists (duplicate protection)
      const existing = await findTeamByIdentifier(leaderEmail);
      if (existing) {
        console.log(`   ⏭️ Skipping: Leader email already exists (${leaderEmail}) – duplicate skipped`);
        continue;
      }

      await saveTeam(team);
      console.log(`   ✅ SUCCESS: ${teamName} (${teamId}) – Access Code: ${accessCode}`);
      successful++;
    } catch (err: any) {
      console.error(`   ❌ FAILED for row ${rowNum} (${teamName}):`, err.message || err);
      failedRows.push({ rowNum, teamName, error: err.message || String(err) });
      failed++;
    }
    console.log('');
  }

  // Final summary
  console.log('────────────────────────────────────────────');
  console.log(`📊 IMPORT SUMMARY:`);
  console.log(`   ✅ Successful imports: ${successful}`);
  console.log(`   ❌ Failed imports: ${failed}`);
  console.log(`   🔄 Duplicates removed: ${duplicateCount}`);
  console.log(`   📦 Unique teams: ${successful}`);

  if (failedRows.length > 0) {
    console.log('\n❌ Failed rows (with errors):');
    failedRows.forEach(f => console.log(`   Row ${f.rowNum}: "${f.teamName}" – ${f.error}`));
  }

  console.log(`\n🎉 Import completed!`);
}

// Run the import
importTeams().catch(err => {
  console.error('❌ Unhandled error:', err);
});