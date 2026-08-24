import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL!;
console.log('url', url);
const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  const res = await client.query('SELECT 1');
  console.log('ok', res.rows);
} catch(err) {
  console.error('error', err);
  console.error('message', err.message);
} finally {
  client.release();
  await pool.end();
}
