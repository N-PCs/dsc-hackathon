import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function clearTeams() {
  try {
    await pool.query('TRUNCATE TABLE teams CASCADE;');
    console.log('✅ Teams table cleared successfully.');
  } catch (err) {
    console.error('❌ Failed to clear teams:', err);
  } finally {
    await pool.end();
  }
}

clearTeams();