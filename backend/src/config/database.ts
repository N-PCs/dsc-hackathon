import { Pool } from '@neondatabase/serverless';
import { Team, Announcement, AdminUser } from '../utils/types.js';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from './redis.js';
import { logger } from '../utils/logger.js';

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
logger.info({ hasUrl: !!connectionString }, '[NeonDB] Connection status');

let pool: Pool | null = null;
let useNeon = false;

if (connectionString) {
  try {
    const clean = connectionString.replace(/&channel_binding=require/g, '').replace(/\?channel_binding=require/g, '');
    pool = new Pool({ connectionString: clean });

    // ✅ Catch pool-level errors to prevent crash
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
}else {
  logger.info('[NeonDB] No DATABASE_URL – using in‑memory store');
}

// In‑memory fallback
let localTeams: Team[] = [];
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
      // Seed default admins
      for (const admin of localAdmins) {
        await client.query(
          `INSERT INTO admin_users (email, name, role, department, added_at)
           VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
          [admin.email, admin.name, admin.role, admin.department, admin.addedAt || new Date().toISOString()]
        );
      }
      logger.info('[NeonDB] Tables ready');
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

export async function updateTeam(team: Team): Promise<Team> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `UPDATE teams SET 
          payment_status = $1, 
          payment_proof_url = $2, 
          checked_in_venue = $3, 
          ticket_issued = $4, 
          notes = $5, 
          amount_paid = $6,
          data = $7 
         WHERE UPPER(id) = UPPER($8)`,
        [
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
let localSubmissionsOpen = false;
let localRegistrationsOpen = true;

export async function getSubmissionStatus(): Promise<boolean> {
  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'submissions_open'");
      if (res.rows.length > 0) {
        const val = res.rows[0].value === 'true';
        setCachedData(CACHE_KEYS.SUBMISSION_STATUS, val).catch(() => {});
        return val;
      }
    } catch (err) {
      handleDBError(err, 'getSubmissionStatus');
    }
  }
  const cached = await getCachedData<boolean>(CACHE_KEYS.SUBMISSION_STATUS);
  if (cached !== null && cached !== undefined) return Boolean(cached);
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
  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'registrations_open'");
      if (res.rows.length > 0) {
        const val = res.rows[0].value === 'true';
        setCachedData(CACHE_KEYS.REGISTRATION_STATUS, val).catch(() => {});
        return val;
      }
    } catch (err) {
      handleDBError(err, 'getRegistrationStatus');
    }
  }
  const cached = await getCachedData<boolean>(CACHE_KEYS.REGISTRATION_STATUS);
  if (cached !== null && cached !== undefined) return Boolean(cached);
  return localRegistrationsOpen;
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