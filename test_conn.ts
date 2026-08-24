import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL!;
console.log('url', url);
const urlNoChannel = url.replace(/&?channel_binding=[^&]*/,'');
console.log('urlNoChannel', urlNoChannel);
const pool = new Pool({ connectionString: urlNoChannel });
const client = await pool.connect();
try {
  const res = await client.query('SELECT 1');
  console.log('ok', res.rows);
} catch(err) {
  console.error('error', err);
} finally {
  client.release();
  await pool.end();
}
