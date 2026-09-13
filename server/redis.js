import { createClient } from 'redis';
import { config } from './config.js';

function redisUrlLooksPlaceholder() {
  const url = config.redisUrl || '';
  return /USERNAME|PASSWORD|REDIS_HOST/i.test(url);
}

export const redis = createClient({
  url: redisUrlLooksPlaceholder() ? 'redis://127.0.0.1:6379' : config.redisUrl,
  socket: {
    connectTimeout: 2500,
    reconnectStrategy: (retries) => (retries > 2 ? false : 250),
  },
});

redis.on('error', (error) => {
  if (!error.message.includes('ECONNREFUSED')) {
    console.error('Redis error:', error.message);
  }
});

export function isRedisReady() {
  return Boolean(redis.isOpen);
}

export async function connectRedis() {
  if (redisUrlLooksPlaceholder()) {
    console.warn('REDIS_URL is still a placeholder. Skipping Redis; auth uses Postgres.');
    return false;
  }
  if (redis.isOpen) return true;
  try {
    await redis.connect();
    return true;
  } catch (error) {
    console.warn(`Redis unavailable (${error.message}). Auth will use Postgres only.`);
    return false;
  }
}

export const COUNTER_KEY = 'url_counter';
export const cacheKey = (code) => `short:${code}`;
