import { connectRedis } from './redis.js';
import { migrate } from './migrate.js';
import { syncCounterFromDatabase } from './services/urlService.js';

let ready;

export async function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await migrate();
      const redisOk = await connectRedis();
      if (redisOk) {
        await syncCounterFromDatabase();
      }
    })();
  }
  await ready;
}
