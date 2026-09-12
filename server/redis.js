import { createClient } from 'redis';
import { config } from './config.js';

export const redis = createClient({
  url: config.redisUrl,
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
