import { app } from '../server/app.js';
import { connectRedis } from '../server/redis.js';
import { migrate } from '../server/migrate.js';
import { syncCounterFromDatabase } from '../server/services/urlService.js';

let ready;

async function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await migrate();
      await connectRedis();
      await syncCounterFromDatabase();
    })();
  }
  await ready;
}

export default async function handler(req, res) {
  await ensureReady();
  return app(req, res);
}
