import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query(`CREATE TEMP TABLE test_jsonb (data JSONB)`);
  const obj = {a:1};
  const jsonStr = JSON.stringify(obj);
  await client.query(`INSERT INTO test_jsonb (data) VALUES ($1)`, [jsonStr]);
  const res = await client.query(`SELECT data FROM test_jsonb`);
  console.log('result:', res.rows[0].data, typeof res.rows[0].data);
} finally {
  client.release();
  await pool.end();
}
