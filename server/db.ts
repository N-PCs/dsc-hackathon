import { Pool } from '@neondatabase/serverless';
import { Team, Announcement, AdminUser } from '../src/types.js';

const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
console.log('[DEBUG] DATABASE_URL loaded:', connectionString ? `${connectionString.slice(0, 25)}...` : 'UNDEFINED');

let pool: Pool | null = null;
let useNeon = false;

if (connectionString) {
  try {
    // Clean string if contains channel_binding=require which breaks SCRAM auth over serverless pools
    const cleanConnectionString = connectionString.replace(/&channel_binding=require/g, '').replace(/\?channel_binding=require/g, '');
    pool = new Pool({ connectionString: cleanConnectionString });
    useNeon = true;
    console.log('[NeonDB] Database URL detected. Initializing Neon DB Pool connection...');
  } catch (err) {
    console.warn('[NeonDB] Failed to initialize Neon Pool. Falling back to local store.', err);
  }
} else {
  console.log('[NeonDB] No DATABASE_URL found in environment. Using reactive memory/local store adapter.');
}

// In-Memory Fallback Store
let localTeams: Team[] = [];
let localAnnouncements: Announcement[] = [];
let localAdmins: AdminUser[] = [
  {
    email: 'neelpandeyofficial@gmail.com',
    name: 'Neel Pandey',
    role: 'Superadmin',
    department: 'Data Science Club Lead',
    addedAt: '2026-08-20',
  },
  {
    email: 'dsc.vitbhopal@gmail.com',
    name: 'DSC Executive Council',
    role: 'Lead Organizer',
    department: 'Core Operations',
    addedAt: '2026-08-15',
  },
  {
    email: 'admin@vitbhopal.ac.in',
    name: 'VIT Operations Head',
    role: 'Superadmin',
    department: 'Academic & Event Affairs',
    addedAt: '2026-08-10',
  },
  {
    email: 'lead.origin@vitbhopal.ac.in',
    name: 'Origin Convener',
    role: 'Lead Organizer',
    department: 'Hackathon Operations',
    addedAt: '2026-08-12',
  },
  {
    email: 'faculty.advisor@vitbhopal.ac.in',
    name: 'Dr. Faculty Coordinator',
    role: 'Faculty Advisor',
    department: 'School of Computing Science',
    addedAt: '2026-08-10',
  },
  { email: 'neel.24bce10303@vitbhopal.ac.in', name: 'Neel', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'aarush.25bcy10047@vitbhopal.ac.in', name: 'Aarush', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'sanskar.24bce11374@vitbhopal.ac.in', name: 'Sanskar', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'nikhil.25bai11440@vitbhopal.ac.in', name: 'Nikhil', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'shresth.24bsa10161@vitbhopal.ac.in', name: 'Shresth', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'tanishka.25bce10056@vitbhopal.ac.in', name: 'Tanishka', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'ritik.24bce11502@vitbhopal.ac.in', name: 'Ritik', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'varun.25bce10360@vitbhopal.ac.in', name: 'Varun', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'rajnarayan.24bec10089@vitbhopal.ac.in', name: 'Rajnarayan', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'anish.25mim10055@vitbhopal.ac.in', name: 'Anish', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
  { email: 'ananya.24bai10039@vitbhopal.ac.in', name: 'Ananya', role: 'Lead Organizer', department: 'Executive Operations', addedAt: '2026-08-23' },
];

function handleDBError(err: any, action: string) {
  if (err?.code === '28P01' || err?.message?.includes('password authentication failed')) {
    console.warn(`[NeonDB Auth Warning] Authentication failed for Neon DB during ${action}. Disabling Neon DB connection and falling back to memory store.`);
    useNeon = false;
  } else {
    console.error(`[NeonDB Error] ${action}:`, err?.message || err);
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

      try {
        await client.query('ALTER TABLE teams ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 150;');
      } catch (e) {}

      // Seed default admins into admin_users table
      for (const admin of localAdmins) {
        try {
          await client.query(
            `INSERT INTO admin_users (email, name, role, department, added_at)
             VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
            [admin.email, admin.name, admin.role, admin.department, admin.addedAt]
          );
        } catch (e) {}
      }

      console.log('[NeonDB] Database tables & default admin whitelist initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    handleDBError(err, 'initDatabase');
  }
}

export async function getAllTeams(): Promise<Team[]> {
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT data FROM teams ORDER BY ctid DESC');
      return res.rows.map((r) => r.data as Team);
    } catch (err) {
      handleDBError(err, 'fetching teams');
    }
  }
  return localTeams;
}

export async function findTeamById(idOrEmail: string): Promise<Team | null> {
  const teams = await getAllTeams();
  const clean = idOrEmail.trim().toLowerCase();
  return (
    teams.find(
      (t) =>
        t.id.toLowerCase() === clean ||
        t.leader.email.toLowerCase() === clean ||
        t.member2?.email?.toLowerCase() === clean ||
        t.member3?.email?.toLowerCase() === clean ||
        t.member4?.email?.toLowerCase() === clean ||
        t.member5?.email?.toLowerCase() === clean
    ) || null
  );
}

export async function saveNewTeam(team: Team): Promise<Team> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO teams (id, team_name, access_code, track, payment_status, payment_proof_url, transaction_ref, registered_at, checked_in_venue, ticket_issued, notes, amount_paid, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
    } catch (err) {
      handleDBError(err, 'inserting team');
    }
  }
  localTeams.unshift(team);
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
    } catch (err) {
      handleDBError(err, 'updating team');
    }
  }
  const idx = localTeams.findIndex((t) => t.id.toUpperCase() === team.id.toUpperCase());
  if (idx !== -1) {
    localTeams[idx] = team;
  }
  return team;
}

export async function deleteTeamById(id: string): Promise<boolean> {
  const cleanId = id.toUpperCase();
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM teams WHERE UPPER(id) = $1', [cleanId]);
    } catch (err) {
      handleDBError(err, 'deleting team');
    }
  }
  localTeams = localTeams.filter((t) => t.id.toUpperCase() !== cleanId);
  return true;
}

export async function getAuthorizedAdminsDB(): Promise<AdminUser[]> {
  const mergedMap = new Map<string, AdminUser>();

  // Ensure default authorized admins are present
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
    } catch (err) {
      handleDBError(err, 'fetching admins');
    }
  }
  return Array.from(mergedMap.values());
}

export async function addAdminDB(admin: AdminUser): Promise<AdminUser[]> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO admin_users (email, name, role, department, added_at)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET name=$2, role=$3, department=$4`,
        [admin.email, admin.name, admin.role, admin.department, admin.addedAt]
      );
    } catch (err) {
      handleDBError(err, 'adding admin');
    }
  }
  if (!localAdmins.some((a) => a.email.toLowerCase() === admin.email.toLowerCase())) {
    localAdmins.push(admin);
  }
  return localAdmins;
}

export async function removeAdminDB(email: string): Promise<AdminUser[]> {
  const clean = email.toLowerCase();
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM admin_users WHERE LOWER(email) = $1', [clean]);
    } catch (err) {
      handleDBError(err, 'removing admin');
    }
  }
  localAdmins = localAdmins.filter((a) => a.email.toLowerCase() !== clean);
  return localAdmins;
}

export async function getAnnouncementsDB(): Promise<Announcement[]> {
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT id, title, message, category, timestamp, sender FROM announcements ORDER BY id DESC');
      return res.rows.map((r) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        category: r.category,
        timestamp: r.timestamp,
        sender: r.sender,
      }));
    } catch (err) {
      handleDBError(err, 'fetching announcements');
    }
  }
  return localAnnouncements;
}

let localSubmissionsOpen = false;
let localRegistrationsOpen = true;

export async function getSubmissionStatusDB(): Promise<boolean> {
  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'submissions_open'");
      if (res.rows.length > 0) {
        return res.rows[0].value === 'true';
      }
    } catch (err) {
      handleDBError(err, 'fetching submission status');
    }
  }
  return localSubmissionsOpen;
}

export async function setSubmissionStatusDB(isOpen: boolean): Promise<boolean> {
  localSubmissionsOpen = isOpen;
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ('submissions_open', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [String(isOpen)]
      );
    } catch (err) {
      handleDBError(err, 'updating submission status');
    }
  }
  return localSubmissionsOpen;
}

export async function getRegistrationStatusDB(): Promise<boolean> {
  if (useNeon && pool) {
    try {
      const res = await pool.query("SELECT value FROM settings WHERE key = 'registrations_open'");
      if (res.rows.length > 0) {
        return res.rows[0].value === 'true';
      }
    } catch (err) {
      handleDBError(err, 'fetching registration status');
    }
  }
  return localRegistrationsOpen;
}

export async function setRegistrationStatusDB(isOpen: boolean): Promise<boolean> {
  localRegistrationsOpen = isOpen;
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ('registrations_open', $1)
         ON CONFLICT (key) DO UPDATE SET value = $1`,
        [String(isOpen)]
      );
    } catch (err) {
      handleDBError(err, 'updating registration status');
    }
  }
  return localRegistrationsOpen;
}

export async function addAnnouncementDB(ann: Announcement): Promise<Announcement> {
  if (useNeon && pool) {
    try {
      await pool.query(
        `INSERT INTO announcements (id, title, message, category, timestamp, sender)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ann.id, ann.title, ann.message, ann.category, ann.timestamp, ann.sender]
      );
    } catch (err) {
      handleDBError(err, 'adding announcement');
    }
  }
  localAnnouncements.unshift(ann);
  return ann;
}

export async function deleteAnnouncementDB(id: string): Promise<boolean> {
  if (useNeon && pool) {
    try {
      await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    } catch (err) {
      handleDBError(err, 'deleting announcement');
    }
  }
  localAnnouncements = localAnnouncements.filter((a) => a.id !== id);
  return true;
}

export async function isTransactionRefUsed(ref: string): Promise<boolean> {
  if (!ref) return false;
  const cleanRef = ref.trim().toLowerCase();
  
  if (useNeon && pool) {
    try {
      const res = await pool.query('SELECT id FROM teams WHERE LOWER(transaction_ref) = $1', [cleanRef]);
      if (res.rows.length > 0) {
        return true;
      }
    } catch (err) {
      handleDBError(err, 'checking transaction ref');
    }
  }
  
  return localTeams.some(t => t.transactionRef?.toLowerCase() === cleanRef);
}

export async function clearAllDataDB(): Promise<boolean> {
  localTeams = [];
  localAnnouncements = [];
  if (useNeon && pool) {
    try {
      await pool.query('TRUNCATE TABLE teams CASCADE;');
      await pool.query('TRUNCATE TABLE announcements CASCADE;');
      console.log('[NeonDB] All teams and announcements data cleared successfully!');
    } catch (err) {
      handleDBError(err, 'clearing all data');
    }
  }
  return true;
}
