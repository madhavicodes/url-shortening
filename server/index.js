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

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    if (!redisOk) {
      console.warn('Redis is not running. Register/login use Neon. Short-link cache uses Postgres fallback.');
    }
  });
}

start().catch(async (error) => {
  console.error('Failed to start API.');
  console.error(error);
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing. Add your Neon connection string in the Render environment.');
  } else {
    console.error('Check DATABASE_URL (Neon) and JWT_SECRET on Render. Redis is optional.');
  }
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
