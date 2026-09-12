import { assertProductionSecrets, config } from './config.js';
import { app } from './app.js';
import { pool } from './db.js';
import { migrate } from './migrate.js';
import { connectRedis } from './redis.js';
import { seed } from './seed.js';
import { syncCounterFromDatabase } from './services/urlService.js';

async function start() {
  assertProductionSecrets();
  await migrate();
  const redisOk = await connectRedis();
  await seed();
  if (redisOk) {
    await syncCounterFromDatabase();
  }

  app.listen(config.port, () => {
    console.log(`ShortScale API listening on http://localhost:${config.port}`);
    if (!redisOk) {
      console.warn('Redis is not running. Register/login use Neon. Short-link cache uses Postgres fallback.');
    }
  });
}

start().catch(async (error) => {
  console.error('Failed to start API.');
  console.error(error.message || error);
  console.error('Start Postgres and Redis first: npm run docker:up');
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
