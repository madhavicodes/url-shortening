import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function migrate() {
  const files = ['001_init.sql', '002_email_otps.sql'];
  for (const file of files) {
    const sql = await readFile(path.join(__dirname, 'sql', file), 'utf8');
    await pool.query(sql);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  migrate()
    .then(async () => {
      console.log('Migrations applied.');
      await pool.end();
    })
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
