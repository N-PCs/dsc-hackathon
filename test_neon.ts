import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
console.log('Connecting...');
const pool = new Pool({ connectionString });
const client = await pool.connect();
try {
  const res = await client.query('SELECT 1 as test');
  console.log('query result:', res.rows);
  const res2 = await client.query('SELECT * FROM teams LIMIT 1');
  console.log('teams rows:', res2.rows);
  if (res2.rows[0]) {
    console.log('data type:', typeof res2.rows[0].data);
    console.log('data sample:', String(res2.rows[0].data).slice(0,200));
  }
} finally {
  client.release();
  await pool.end();
}
