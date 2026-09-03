import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../.env' });
dotenv.config({ path: '../.env.local' });

import { neonConfig, Pool } from '@neondatabase/serverless';
import { Team, Announcement, AdminUser } from '../utils/types.js';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from './redis.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_SUBMISSION_DEADLINE } from '../utils/deadline.js';

// Use HTTP fetch instead of long-lived WebSockets — prevents socket hang-up on Vercel
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
logger.info({ hasUrl: !!connectionString }, '[NeonDB] Connection status');

let pool: Pool | null = null;
let useNeon = false;

if (connectionString) {
  try {
    const clean = connectionString.replace(/&channel_binding=require/g, '').replace(/\?channel_binding=require/g, '');
    pool = new Pool({
      connectionString: clean,
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 10000,
    });

    pool.on('error', (err: any) => {
      logger.error({ err }, '[NeonDB] Pool error – switching to memory fallback');
      useNeon = false;
      pool = null;
    });

    useNeon = true;
    logger.info('[NeonDB] Pool created');
  } catch (err) {
    logger.warn({ err }, '[NeonDB] Failed to create pool – using memory fallback');
  }
} else {
  logger.info('[NeonDB] No DATABASE_URL – using in‑memory store');
}

// Dummy verified lead team
const DUMMY_LEAD_TEAM: Team = {
  id: 'ORIGIN-101',
  teamName: 'NeuralPulse AI',
  accessCode: '1001',
  track: 'AI & Machine Learning',
  leader: {
    name: 'Neel Shukla',
    email: 'neel.24bce10303@vitbhopal.ac.in',
    phone: '+91 98765 43210',
    college: 'VIT Bhopal University',
    role: 'Team Lead',
    registrationNumber: '24BCE10303',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
  },
  member2: {
    name: 'Aarav Sharma',
    email: 'aarav.24bce10101@vitbhopal.ac.in',
    phone: '+91 98765 11111',
    registrationNumber: '24BCE10101',
    college: 'VIT Bhopal University',
    role: 'Full Stack Developer',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
  },
  member3: {
    name: 'Priya Patel',
    email: 'priya.24bce10202@vitbhopal.ac.in',
    phone: '+91 98765 22222',
    registrationNumber: '24BCE10202',
    college: 'VIT Bhopal University',
    role: 'ML Engineer',
    residentialStatus: 'Day Scholar',
  },
  paymentStatus: 'verified',
  paymentProofUrl: 'https://ik.imagekit.io/origin/demo-receipt.png',
  transactionRef: 'UPI/ORIGIN/NEEL24BCE10303',
  amountPaid: 419,
  registeredAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
  checkedInVenue: true,
  ticketIssued: true,
  notes: 'Verified Lead Team - Ready for Project Submission',
};

const TEST_TEAM: Team = {
  id: 'ORIGIN-TEST-999',
  teamName: 'Test Team Varun',
  accessCode: '1234',
  track: 'AI & Machine Learning',
  leader: {
    name: 'Varun saini',
    email: 'varum.25bce10360@vitbhopal.ac.in',
    phone: '+91 98765 43210',
    college: 'VIT Bhopal University',
    role: 'Team Lead',
    registrationNumber: '25BCE10360',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
  },
  member2: {
    name: 'Demo Member 2',
    email: 'demo2@vitbhopal.ac.in',
    phone: '+91 98765 11111',
    registrationNumber: '25BCE10001',
    college: 'VIT Bhopal University',
    role: 'Member',
    residentialStatus: 'Hosteller',
    messName: 'Anchor (Boys)',
  },
  member3: {
    name: 'Demo Member 3',
    email: 'demo3@vitbhopal.ac.in',
    phone: '+91 98765 22222',
    registrationNumber: '25BCE10002',
    college: 'VIT Bhopal University',
    role: 'Member',
    residentialStatus: 'Day Scholar',
  },
  paymentStatus: 'verified',
  paymentProofUrl: 'https://ik.imagekit.io/origin/demo-receipt.png',
  transactionRef: 'UPI/TEST/VARUN',
  amountPaid: 419,
  registeredAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
  checkedInVenue: false,
  ticketIssued: true,
  notes: 'Test team – remove after testing',
};

// In‑memory fallback
let localTeams: Team[] = [DUMMY_LEAD_TEAM, TEST_TEAM];
let localAnnouncements: Announcement[] = [];
let localAdmins: AdminUser[] = [
  { email: 'admin@vitbhopal.ac.in', name: 'Admin', role: 'Superadmin', department: 'DSC' },
];

function handleDBError(err: any, action: string) {
  if (err?.code === '28P01' || err?.message?.includes('password authentication failed')) {
    logger.warn({ err, action }, '[NeonDB] Auth failed – switching to memory fallback');
    useNeon = false;
  } else {
    logger.error({ err, action }, '[NeonDB] Error');
  }
}

export async function initDatabase() {
  if (!useNeon || !pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id VARCHAR(50) PRIMARY KEY,
          team_name VARCHAR(255) NOT NULL,
          access_code VARCHAR(10) NOT NULL,
          track VARCHAR(100) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_proof_url TEXT,
          transaction_ref VARCHAR(100),
          registered_at VARCHAR(100),
          checked_in_venue BOOLEAN DEFAULT FALSE,
          ticket_issued BOOLEAN DEFAULT FALSE,
          notes TEXT,
          amount_paid INTEGER DEFAULT 150,
          data JSONB NOT NULL
        );
        CREATE TABLE IF NOT EXISTS admin_users (
          email VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(100),
          department VARCHAR(100),
          added_at VARCHAR(50)
        );
        CREATE TABLE IF NOT EXISTS announcements (
          id VARCHAR(100) PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          category VARCHAR(50),
          timestamp VARCHAR(100),
          sender VARCHAR(100)
        );
        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      for (const admin of localAdmins) {
        await client.query(
          `INSERT INTO admin_users (email, name, role, department, added_at)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
          [admin.email, admin.name, admin.role, admin.department, admin.addedAt || new Date().toISOString()]
        );
      }
      // Seed dummy
      await client.query(
        `INSERT INTO teams (id, team_name, access_code, track, payment_status, payment_proof_url, transaction_ref, registered_at, checked_in_venue, ticket_issued, notes, amount_paid, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          DUMMY_LEAD_TEAM.id,
          DUMMY_LEAD_TEAM.teamName,
          DUMMY_LEAD_TEAM.accessCode,
          DUMMY_LEAD_TEAM.track,
          DUMMY_LEAD_TEAM.paymentStatus,
          DUMMY_LEAD_TEAM.paymentProofUrl || '',
          DUMMY_LEAD_TEAM.transactionRef || '',
          DUMMY_LEAD_TEAM.registeredAt,
          DUMMY_LEAD_TEAM.checkedInVenue || false,
          DUMMY_LEAD_TEAM.ticketIssued || false,
          DUMMY_LEAD_TEAM.notes || '',
          DUMMY_LEAD_TEAM.amountPaid || 150,
          JSON.stringify(DUMMY_LEAD_TEAM),
        ]
      );
      // Seed test team
      await client.query(
        `INSERT INTO teams (id, team_name, access_code, track, payment_status, payment_proof_url, transaction_ref, registered_at, checked_in_venue, ticket_issued, notes, amount_paid, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          TEST_TEAM.id,
          TEST_TEAM.teamName,
          TEST_TEAM.accessCode,
          TEST_TEAM.track,
          TEST_TEAM.paymentStatus,
          TEST_TEAM.paymentProofUrl || '',
          TEST_TEAM.transactionRef || '',
          TEST_TEAM.registeredAt,
          TEST_TEAM.checkedInVenue || false,
          TEST_TEAM.ticketIssued || false,
          TEST_TEAM.notes || '',
          TEST_TEAM.amountPaid || 150,
          JSON.stringify(TEST_TEAM),
        ]
      );
      logger.info('[NeonDB] Tables ready and test team seeded');
    } finally {
      client.release();
    }
  } catch (err) {
    handleDBError(err, 'initDatabase');
  }
}

// ---- Team queries ----
export async function getAllTeams(): Promise<Team[]> {
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT data FROM teams ORDER BY ctid DESC');
      const teams = res.rows.map((r) => r.data as Team);
      setCachedData(CACHE_KEYS.TEAMS, teams).catch(() => {});
      localTeams = teams;
      return teams;
    } catch (err) {
      handleDBError(err, 'getAllTeams');
    }
  }
  const cached = await getCachedData<Team[]>(CACHE_KEYS.TEAMS);
  if (cached && Array.isArray(cached)) {
    localTeams = cached;
    return cached;
  }
  return localTeams;
}

function buildWhereClauses(options: {
  search: string;
  status: string;
  track: string;
  hasProject?: boolean;
  scored?: 'all' | 'true' | 'false';
}): { whereClauses: string[]; params: any[]; paramIndex: number } {
  const whereClauses: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  const { search, status, track, hasProject, scored } = options;

  if (search) {
    whereClauses.push(`
      (
        team_name ILIKE $${paramIndex}
        OR data->'leader'->>'name' ILIKE $${paramIndex}
        OR data->'leader'->>'email' ILIKE $${paramIndex}
        OR id ILIKE $${paramIndex}
        OR transaction_ref ILIKE $${paramIndex}
      )
    `);
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status !== 'all') {
    whereClauses.push(`payment_status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (track !== 'all') {
    whereClauses.push(`track = $${paramIndex}`);
    params.push(track);
    paramIndex++;
  }

  if (hasProject) {
    whereClauses.push(`data->'project' IS NOT NULL`);
  }

  if (scored && scored !== 'all') {
    const isScored = scored === 'true';
    whereClauses.push(`(data->'project'->'score' IS ${isScored ? 'NOT' : ''} NULL)`);
  }

  return { whereClauses, params, paramIndex };
}

/**
 * Shared in-memory filter & pagination logic (used as fallback and when Neon is off)
 */
function runMemoryFallback(
  page: number,
  limit: number,
  search: string,
  status: string,
  track: string,
  hasProject?: boolean,
  scored?: 'all' | 'true' | 'false'
) {
  const offset = (page - 1) * limit;
  let allTeams = localTeams.slice(); // use current in-memory snapshot

  if (search) {
    const s = search.toLowerCase();
    allTeams = allTeams.filter(t =>
      t.teamName.toLowerCase().includes(s) ||
      t.leader.name.toLowerCase().includes(s) ||
      t.leader.email.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s) ||
      t.transactionRef?.toLowerCase().includes(s)
    );
  }
  if (status !== 'all') {
    allTeams = allTeams.filter(t => t.paymentStatus === status);
  }
  if (track !== 'all') {
    allTeams = allTeams.filter(t => t.track === track);
  }
  if (hasProject) {
    allTeams = allTeams.filter(t => !!t.project);
  }
  if (scored && scored !== 'all') {
    const hasScore = scored === 'true';
    allTeams = allTeams.filter(t => hasScore ? !!t.project?.score : !t.project?.score);
  }

  const total = allTeams.length;
  const paginated = allTeams.slice(offset, offset + limit);

  // Count evaluated/pending (ignoring the scored filter)
  let baseTeams = localTeams.slice();
  if (search) {
    const s = search.toLowerCase();
    baseTeams = baseTeams.filter(t =>
      t.teamName.toLowerCase().includes(s) ||
      t.leader.name.toLowerCase().includes(s) ||
      t.leader.email.toLowerCase().includes(s) ||
      t.id.toLowerCase().includes(s) ||
      t.transactionRef?.toLowerCase().includes(s)
    );
  }
  if (status !== 'all') {
    baseTeams = baseTeams.filter(t => t.paymentStatus === status);
  }
  if (track !== 'all') {
    baseTeams = baseTeams.filter(t => t.track === track);
  }
  if (hasProject) {
    baseTeams = baseTeams.filter(t => !!t.project);
  }
  const projectTeams = baseTeams.filter(t => !!t.project);
  const evaluatedCount = projectTeams.filter(t => !!t.project?.score).length;
  const pendingCount = projectTeams.length - evaluatedCount;

  return { teams: paginated, total, page, limit, evaluatedCount, pendingCount };
}

export async function getPaginatedTeams(options: {
  page: number;
  limit: number;
  search: string;
  status: string;
  track: string;
  hasProject?: boolean;
  scored?: 'all' | 'true' | 'false';
}) {
  const { page, limit, search, status, track, hasProject, scored } = options;

  // If Neon is not available, use in‑memory directly
  if (!useNeon || !pool) {
    return runMemoryFallback(page, limit, search, status, track, hasProject, scored);
  }

  // Build WHERE clauses
  const { whereClauses, params, paramIndex } = buildWhereClauses({
    search,
    status,
    track,
    hasProject,
    scored,
  });
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  try {
    // 1. Count total (with all filters including scored)
    const countQuery = `SELECT COUNT(*) FROM teams ${whereSql}`;
    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0].count, 10);

    // 2. Get paginated teams – try to order by registered_at, fallback to id if that fails
    let dataQuery = `
      SELECT data FROM teams
      ${whereSql}
      ORDER BY registered_at DESC NULLS LAST
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    let dataParams = [...params, limit, offset];
    let dataRes;
    try {
      dataRes = await pool.query(dataQuery, dataParams);
    } catch (orderErr) {
      // If ordering by registered_at fails (e.g. column missing), fallback to order by id
      logger.warn({ err: orderErr }, '[NeonDB] Order by registered_at failed, falling back to id');
      dataQuery = `
        SELECT data FROM teams
        ${whereSql}
        ORDER BY id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      dataRes = await pool.query(dataQuery, dataParams);
    }
    const teams = dataRes.rows.map(r => r.data as Team);

    // 3. Count evaluated/pending (without the scored condition)
    const { whereClauses: countWhereClauses, params: countParams } = buildWhereClauses({
      search,
      status,
      track,
      hasProject,
      // scored: undefined → excludes scored condition
    });
    const countWhereSql = countWhereClauses.length ? `WHERE ${countWhereClauses.join(' AND ')}` : '';

    const evalCountQuery = `
      SELECT COUNT(*) FROM teams
      ${countWhereSql ? countWhereSql + ' AND' : 'WHERE'}
      data->'project' IS NOT NULL
      AND data->'project'->'score' IS NOT NULL
    `;
    const pendingCountQuery = `
      SELECT COUNT(*) FROM teams
      ${countWhereSql ? countWhereSql + ' AND' : 'WHERE'}
      data->'project' IS NOT NULL
      AND data->'project'->'score' IS NULL
    `;

    const evalRes = await pool.query(evalCountQuery, countParams);
    const pendingRes = await pool.query(pendingCountQuery, countParams);
    const evaluatedCount = parseInt(evalRes.rows[0].count, 10);
    const pendingCount = parseInt(pendingRes.rows[0].count, 10);

    return { teams, total, page, limit, evaluatedCount, pendingCount };
  } catch (err) {
    // ❗ Any Neon error → fall back to in‑memory
    handleDBError(err, 'getPaginatedTeams');
    logger.warn({ err }, '[NeonDB] Falling back to in‑memory pagination');
    return runMemoryFallback(page, limit, search, status, track, hasProject, scored);
  }
}

export async function findTeamByIdentifier(identifier: string): Promise<Team | null> {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const cleanUpper = identifier.trim().toUpperCase();

  if (useNeon && pool) {
    try {
      const res = await pool.query(
        `SELECT data FROM teams 
         WHERE UPPER(id) = $1 
            OR LOWER(data->'leader'->>'email') = $2 
            OR LOWER(data->'member2'->>'email') = $2 
            OR LOWER(data->'member3'->>'email') = $2 
            OR LOWER(data->'member4'->>'email') = $2 
            OR LOWER(data->'member5'->>'email') = $2 
         LIMIT 1`,
        [cleanUpper, clean]
      );
      if (res.rows.length > 0) return res.rows[0].data as Team;
    } catch (err) {
      handleDBError(err, 'findTeamByIdentifier');
    }
  }
  const teams = await getAllTeams();
  return teams.find(
    (t) =>
      t.id.toLowerCase() === clean ||
      t.leader.email.toLowerCase() === clean ||
      t.member2?.email?.toLowerCase() === clean ||
      t.member3?.email?.toLowerCase() === clean ||
      t.member4?.email?.toLowerCase() === clean ||
      t.member5?.email?.toLowerCase() === clean
  ) || null;
}

export async function findTeamById(id: string): Promise<Team | null> {
  if (!id) return null;
  const cleanUpper = id.trim().toUpperCase();
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT data FROM teams WHERE UPPER(id) = $1', [cleanUpper]);
      if (res.rows.length > 0) return res.rows[0].data as Team;
    } catch (err) {
      handleDBError(err, 'findTeamById');
    }
  }
  const teams = await getAllTeams();
  return teams.find((t) => t.id.toUpperCase() === cleanUpper) || null;
}

export async function saveTeam(team: Team): Promise<Team> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO teams (id, team_name, access_code, track, payment_status, payment_proof_url, transaction_ref, registered_at, checked_in_venue, ticket_issued, notes, amount_paid, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           team_name = EXCLUDED.team_name,
           access_code = EXCLUDED.access_code,
           track = EXCLUDED.track,
           payment_status = EXCLUDED.payment_status,
           payment_proof_url = EXCLUDED.payment_proof_url,
           transaction_ref = EXCLUDED.transaction_ref,
           registered_at = EXCLUDED.registered_at,
           checked_in_venue = EXCLUDED.checked_in_venue,
           ticket_issued = EXCLUDED.ticket_issued,
           notes = EXCLUDED.notes,
           amount_paid = EXCLUDED.amount_paid,
           data = EXCLUDED.data`,
        [
          team.id,
          team.teamName,
          team.accessCode,
          team.track,
          team.paymentStatus,
          team.paymentProofUrl || '',
          team.transactionRef || '',
          team.registeredAt,
          team.checkedInVenue || false,
          team.ticketIssued || false,
          team.notes || '',
          team.amountPaid || 150,
          JSON.stringify(team),
        ]
      );
      logger.info({ teamId: team.id }, '[NeonDB] Team saved');
    } catch (err: any) {
      handleDBError(err, 'saveTeam');
      throw new Error(`Database error: ${err?.message || 'Unknown'}`);
    }
  }
  localTeams = [team, ...localTeams.filter((t) => t.id.toUpperCase() !== team.id.toUpperCase())];
  await invalidateCache(CACHE_KEYS.TEAMS);
  return team;
}

/**
 * `track` and `team_name` are included in the UPDATE statement to keep the
 * SQL column in sync with the JSONB data.
 */
export async function updateTeam(team: Team): Promise<Team> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `UPDATE teams SET 
          team_name = $1,
          track = $2,
          payment_status = $3, 
          payment_proof_url = $4, 
          checked_in_venue = $5, 
          ticket_issued = $6, 
          notes = $7, 
          amount_paid = $8,
          data = $9 
         WHERE UPPER(id) = UPPER($10)`,
        [
          team.teamName,
          team.track,
          team.paymentStatus,
          team.paymentProofUrl || '',
          team.checkedInVenue || false,
          team.ticketIssued || false,
          team.notes || '',
          team.amountPaid || 150,
          JSON.stringify(team),
          team.id,
        ]
      );
      logger.info({ teamId: team.id }, '[NeonDB] Team updated');
    } catch (err: any) {
      handleDBError(err, 'updateTeam');
      throw new Error(`Database error: ${err?.message || 'Unknown'}`);
    }
  }
  const idx = localTeams.findIndex((t) => t.id.toUpperCase() === team.id.toUpperCase());
  if (idx !== -1) localTeams[idx] = team;
  else localTeams.push(team);
  await invalidateCache(CACHE_KEYS.TEAMS);
  return team;
}

export async function deleteTeam(id: string): Promise<void> {
  const cleanId = id.toUpperCase();
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM teams WHERE UPPER(id) = $1', [cleanId]);
    } catch (err) {
      handleDBError(err, 'deleteTeam');
    }
  }
  localTeams = localTeams.filter((t) => t.id.toUpperCase() !== cleanId);
  await invalidateCache(CACHE_KEYS.TEAMS);
}

export async function isTransactionRefUsed(ref: string): Promise<boolean> {
  if (!ref) return false;
  const cleanRef = ref.trim().toLowerCase();
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT id FROM teams WHERE LOWER(transaction_ref) = $1', [cleanRef]);
      if (res.rows.length > 0) return true;
    } catch (err) {
      handleDBError(err, 'isTransactionRefUsed');
    }
  }
  return localTeams.some((t) => t.transactionRef?.toLowerCase() === cleanRef);
}

// ---- Admin queries ----
export async function getAuthorizedAdmins(): Promise<AdminUser[]> {
  const mergedMap = new Map<string, AdminUser>();
  for (const admin of localAdmins) {
    mergedMap.set(admin.email.toLowerCase(), admin);
  }
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT email, name, role, department, added_at FROM admin_users');
      for (const r of res.rows) {
        mergedMap.set(r.email.toLowerCase(), {
          email: r.email,
          name: r.name,
          role: r.role,
          department: r.department,
          addedAt: r.added_at,
        });
      }
      const list = Array.from(mergedMap.values());
      setCachedData(CACHE_KEYS.ADMINS, list).catch(() => {});
      return list;
    } catch (err) {
      handleDBError(err, 'getAuthorizedAdmins');
    }
  }
  const cached = await getCachedData<AdminUser[]>(CACHE_KEYS.ADMINS);
  if (cached && Array.isArray(cached)) return cached;
  return Array.from(mergedMap.values());
}

export async function addAdmin(admin: AdminUser): Promise<AdminUser[]> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO admin_users (email, name, role, department, added_at)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name=$2, role=$3, department=$4`,
        [admin.email, admin.name, admin.role, admin.department, admin.addedAt]
      );
    } catch (err) {
      handleDBError(err, 'addAdmin');
    }
  }
  if (!localAdmins.some((a) => a.email.toLowerCase() === admin.email.toLowerCase())) {
    localAdmins.push(admin);
  }
  await invalidateCache(CACHE_KEYS.ADMINS);
  return localAdmins;
}

export async function removeAdmin(email: string): Promise<AdminUser[]> {
  const clean = email.toLowerCase();
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM admin_users WHERE LOWER(email) = $1', [clean]);
    } catch (err) {
      handleDBError(err, 'removeAdmin');
    }
  }
  localAdmins = localAdmins.filter((a) => a.email.toLowerCase() !== clean);
  await invalidateCache(CACHE_KEYS.ADMINS);
  return localAdmins;
}

// ---- Announcements ----
export async function getAnnouncements(): Promise<Announcement[]> {
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT id, title, message, category, timestamp, sender FROM announcements ORDER BY id DESC');
      const list = res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        category: r.category,
        timestamp: r.timestamp,
        sender: r.sender,
      }));
      setCachedData(CACHE_KEYS.ANNOUNCEMENTS, list).catch(() => {});
      return list;
    } catch (err) {
      handleDBError(err, 'getAnnouncements');
    }
  }
  const cached = await getCachedData<Announcement[]>(CACHE_KEYS.ANNOUNCEMENTS);
  if (cached && Array.isArray(cached)) return cached;
  return localAnnouncements;
}

export async function addAnnouncement(ann: Announcement): Promise<Announcement> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO announcements (id, title, message, category, timestamp, sender)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ann.id, ann.title, ann.message, ann.category, ann.timestamp, ann.sender]
      );
    } catch (err) {
      handleDBError(err, 'addAnnouncement');
    }
  }
  localAnnouncements.unshift(ann);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
  return ann;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    } catch (err) {
      handleDBError(err, 'deleteAnnouncement');
    }
  }
  localAnnouncements = localAnnouncements.filter((a) => a.id !== id);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
}

// ---- Settings ----
let localSubmissionsOpen = true;
let localRegistrationsOpen = true;

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === 'false') return value === 'true';
  return fallback;
}

export async function getSubmissionStatus(): Promise<boolean> {
  const cached = await getCachedData<boolean | string>(CACHE_KEYS.SUBMISSION_STATUS);
  if (cached !== null && cached !== undefined) return coerceBoolean(cached, localSubmissionsOpen);

  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'submissions_open'");
      if (res.rows.length > 0) {
        const val = res.rows[0].value === 'true';
        localSubmissionsOpen = val;
        setCachedData(CACHE_KEYS.SUBMISSION_STATUS, val).catch(() => {});
        return val;
      }
    } catch (err) {
      handleDBError(err, 'getSubmissionStatus');
    }
  }
  return localSubmissionsOpen;
}

export async function setSubmissionStatus(isOpen: boolean): Promise<void> {
  localSubmissionsOpen = isOpen;
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ('submissions_open', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [String(isOpen)]
      );
    } catch (err) {
      handleDBError(err, 'setSubmissionStatus');
    }
  }
  await setCachedData(CACHE_KEYS.SUBMISSION_STATUS, isOpen);
}

export async function getRegistrationStatus(): Promise<boolean> {
  const cached = await getCachedData<boolean | string>(CACHE_KEYS.REGISTRATION_STATUS);
  if (cached !== null && cached !== undefined) return coerceBoolean(cached, localRegistrationsOpen);

  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'registrations_open'");
      if (res.rows.length > 0) {
        const val = res.rows[0].value === 'true';
        localRegistrationsOpen = val;
        setCachedData(CACHE_KEYS.REGISTRATION_STATUS, val).catch(() => {});
        return val;
      }
    } catch (err) {
      handleDBError(err, 'getRegistrationStatus');
    }
  }
  return localRegistrationsOpen;
}


export async function getDeadline(): Promise<string> {
  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'submission_deadline'");
      if (res.rows.length > 0) return res.rows[0].value;
    } catch (err) { handleDBError(err, 'getDeadline'); }
  }
  // fallback to env or default
  return process.env.SUBMISSION_DEADLINE || DEFAULT_SUBMISSION_DEADLINE;
}

export async function setDeadline(deadline: string): Promise<void> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ('submission_deadline', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [deadline]
      );
    } catch (err) { handleDBError(err, 'setDeadline'); }
  }
  // invalidate cache
  await invalidateCache(CACHE_KEYS.SUBMISSION_DEADLINE);
}

export async function setRegistrationStatus(isOpen: boolean): Promise<void> {
  localRegistrationsOpen = isOpen;
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ('registrations_open', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [String(isOpen)]
      );
    } catch (err) {
      handleDBError(err, 'setRegistrationStatus');
    }
  }
  await setCachedData(CACHE_KEYS.REGISTRATION_STATUS, isOpen);
}

export async function clearAllData(): Promise<void> {
  localTeams = [];
  localAnnouncements = [];
  if (useNeon && pool) {
    try {
      await pool.query('TRUNCATE TABLE teams CASCADE;');
      await pool.query('TRUNCATE TABLE announcements CASCADE;');
      logger.info('[NeonDB] All data cleared');
    } catch (err) {
      handleDBError(err, 'clearAllData');
    }
  }
  await invalidateCache(CACHE_KEYS.TEAMS);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
}