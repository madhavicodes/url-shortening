import path from 'path';
import { fileURLToPath } from 'url';
import { query, pool } from './db.js';
import { connectRedis } from './redis.js';
import { hashPassword } from './lib/passwords.js';
import { syncCounterFromDatabase, warmAllCache } from './services/urlService.js';

const DEMO_USERS = [
  {
    username: 'alice_dev',
    email: 'alice@techscale.io',
    password: 'password123',
    fullName: 'Alice Developer',
    role: 'Standard User',
    roleType: 'user',
    isAdmin: false,
    organization: 'CloudScale Inc.',
    bio: 'Creating marketing campaigns, vanity short URLs, and tracking click conversion rates.',
    avatarColor: 'from-pink-500 to-rose-600',
    initials: 'AD',
    plan: 'Standard Plan',
  },
  {
    username: 'bob_user',
    email: 'bob@cloud.dev',
    password: 'password123',
    fullName: 'Bob Martinez',
    role: 'Standard User',
    roleType: 'user',
    isAdmin: false,
    organization: 'Apex Systems',
    bio: 'Generating short URLs for social sharing and event registration campaigns.',
    avatarColor: 'from-indigo-500 to-cyan-600',
    initials: 'BM',
    plan: 'Standard Plan',
  },
  {
    username: 'system-admin',
    email: 'admin@sho.rt',
    password: 'adminpassword',
    fullName: 'System Administrator',
    role: 'Lead Infrastructure Architect (Admin)',
    roleType: 'admin',
    isAdmin: true,
    organization: 'ShortScale Core',
    bio: 'Managing clusters, PostgreSQL replicas, and Redis health.',
    avatarColor: 'from-purple-600 to-indigo-700',
    initials: 'SA',
    plan: 'Super Admin',
  },
];

const SEED_URLS = [
  {
    counterId: 1000000000,
    shortCode: '15ftgG',
    originalUrl: 'https://github.com/torvalds/linux',
    createdBy: 'system-admin',
  },
  {
    counterId: 1000000001,
    shortCode: 'wiki-base62',
    originalUrl: 'https://en.wikipedia.org/wiki/Base62',
    createdBy: 'alice_dev',
    customAlias: 'wiki-base62',
  },
  {
    counterId: 1000000002,
    shortCode: 'redis-incr',
    originalUrl: 'https://redis.io/docs/latest/commands/incr/',
    createdBy: 'bob_user',
    customAlias: 'redis-incr',
  },
];

export async function seed() {
  for (const user of DEMO_USERS) {
    await query(
      `INSERT INTO users (username, email, password_hash, full_name, role, role_type, is_admin, organization, bio, avatar_color, initials, plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (username) DO NOTHING`,
      [
        user.username,
        user.email,
        await hashPassword(user.password),
        user.fullName,
        user.role,
        user.roleType,
        user.isAdmin,
        user.organization,
        user.bio,
        user.avatarColor,
        user.initials,
        user.plan,
      ]
    );
  }

  for (const url of SEED_URLS) {
    await query(
      `INSERT INTO urls (counter_id, short_code, original_url, custom_alias, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (short_code) DO NOTHING`,
      [url.counterId, url.shortCode, url.originalUrl, url.customAlias || null, url.createdBy]
    );
  }

  const redisOk = await connectRedis();
  if (redisOk) {
    await syncCounterFromDatabase();
    await warmAllCache();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seed()
    .then(async () => {
      console.log('Demo users and seed URLs are ready.');
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
