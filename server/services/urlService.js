import { encodeBase62 } from '../../src/utils/base62.js';
import { createPublicSlug, isReservedSlug } from '../../src/utils/shortCode.js';
import { config } from '../config.js';
import { query } from '../db.js';
import { cacheKey, COUNTER_KEY, isRedisReady, redis } from '../redis.js';
import { normalizeUrl, sanitizeAlias, toPublicUrl } from '../lib/mappers.js';
import { parseBrowser, parseDevice, resolveGeo } from '../lib/requestMeta.js';

const batchPool = [];

async function cacheSet(code, value) {
  if (!isRedisReady()) return;
  await redis.set(cacheKey(code), value, { expiration: { type: 'EX', value: config.cacheTtlSeconds } });
}

async function cacheGet(code) {
  if (!isRedisReady()) return null;
  return redis.get(cacheKey(code));
}

async function cacheDel(code) {
  if (!isRedisReady()) return;
  await redis.del(cacheKey(code));
}

function pushTrace(steps, step) {
  steps.push({
    status: 'completed',
    ...step,
  });
}

export async function syncCounterFromDatabase() {
  if (!isRedisReady()) return;
  const result = await query('SELECT COALESCE(MAX(counter_id), $1) AS max FROM urls', [config.counterStart]);
  const max = Number(result.rows[0]?.max || config.counterStart);
  const current = Number((await redis.get(COUNTER_KEY)) || 0);
  if (current < max) {
    await redis.set(COUNTER_KEY, String(max));
  }
  if (current === 0 && max <= config.counterStart) {
    await redis.set(COUNTER_KEY, String(config.counterStart));
  }
}

async function nextCounterFromPostgres() {
  const result = await query('SELECT COALESCE(MAX(counter_id), $1) + 1 AS next FROM urls', [config.counterStart - 1]);
  return Number(result.rows[0]?.next || config.counterStart + 1);
}

async function nextCounterId(simulateBatching, steps) {
  if (!isRedisReady()) {
    const assigned = await nextCounterFromPostgres();
    pushTrace(steps, {
      id: 'step-3',
      title: 'Postgres Counter Fallback',
      service: 'database',
      action: 'SELECT MAX(counter_id) + 1',
      latencyMs: 8,
      details: `Redis is down. Assigned ${assigned} from Postgres.`,
      data: { counterId: assigned },
    });
    return assigned;
  }

  if (simulateBatching) {
    if (batchPool.length === 0) {
      const start = Number(await redis.incrBy(COUNTER_KEY, 1000)) - 999;
      for (let i = 0; i < 1000; i += 1) batchPool.push(start + i);
      const assigned = batchPool.shift();
      pushTrace(steps, {
        id: 'step-3',
        title: 'Redis Atomic Counter Increment',
        service: 'redis-counter',
        action: 'INCRBY 1000 (Batched)',
        latencyMs: 1.8,
        details: `Reserved 1000 IDs from Redis starting at ${start}.`,
        data: { counterId: assigned },
      });
      return assigned;
    }
    const assigned = batchPool.shift();
    pushTrace(steps, {
      id: 'step-3',
      title: 'Redis Atomic Counter Increment',
      service: 'redis-counter',
      action: 'INCRBY 1000 (Batched)',
      latencyMs: 0.05,
      details: `Used next ID from the write-service memory pool (${batchPool.length} remaining).`,
      data: { counterId: assigned },
    });
    return assigned;
  }

  const assigned = Number(await redis.incr(COUNTER_KEY));
  pushTrace(steps, {
    id: 'step-3',
    title: 'Redis Atomic Counter Increment',
    service: 'redis-counter',
    action: 'INCR global_url_counter',
    latencyMs: 0.85,
    details: `Redis INCR returned ${assigned}.`,
    data: { counterId: assigned },
  });
  return assigned;
}

export async function isCached(code) {
  if (!isRedisReady()) return false;
  return Boolean(await redis.exists(cacheKey(code)));
}

export async function getCacheSize() {
  if (!isRedisReady()) return 0;
  const keys = await redis.keys('short:*');
  return keys.length;
}

export async function getCounter() {
  if (!isRedisReady()) {
    const result = await query('SELECT COALESCE(MAX(counter_id), $1) AS max FROM urls', [config.counterStart]);
    return Number(result.rows[0]?.max || config.counterStart);
  }
  return Number((await redis.get(COUNTER_KEY)) || config.counterStart);
}

export async function loadClickEvents(urlId, limit = 50) {
  const result = await query(
    'SELECT * FROM click_events WHERE url_id = $1 ORDER BY occurred_at DESC LIMIT $2',
    [urlId, limit]
  );
  return result.rows;
}

export async function toClientUrl(row) {
  const [events, cached] = await Promise.all([loadClickEvents(row.id), isCached(row.short_code)]);
  return toPublicUrl(row, { clickEvents: events, cached });
}

export async function listUrls({ user, search }) {
  const params = [];
  let where = '';
  if (!user?.isAdmin) {
    params.push(user?.username || 'guest');
    where = `WHERE created_by = $${params.length}`;
  }
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where += `${where ? ' AND' : 'WHERE'} (LOWER(short_code) LIKE $${params.length} OR LOWER(original_url) LIKE $${params.length})`;
  }
  const result = await query(`SELECT * FROM urls ${where} ORDER BY created_at DESC LIMIT 200`, params);
  return Promise.all(result.rows.map((row) => toClientUrl(row)));
}

export async function getUrlByCode(code) {
  const result = await query('SELECT * FROM urls WHERE LOWER(short_code) = LOWER($1) LIMIT 1', [code]);
  return result.rows[0] || null;
}

async function allocatePublicSlug() {
  for (let size = 7; size <= 9; size += 1) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = createPublicSlug(size);
      if (isReservedSlug(candidate)) continue;
      const existing = await getUrlByCode(candidate);
      if (!existing) return candidate;
    }
  }
  throw new Error('Could not allocate a unique short link. Please try again.');
}

export async function getUrlById(id) {
  const result = await query('SELECT * FROM urls WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
}

export async function shortenUrl({ originalUrl, customAlias, expirationTime, createdBy, applyXor, simulateBatching }) {
  const started = performance.now();
  const steps = [];
  const normalized = normalizeUrl(originalUrl);

  pushTrace(steps, {
    id: 'step-1',
    title: 'Client Request Sent',
    service: 'client',
    action: 'POST /api/urls HTTP/1.1',
    latencyMs: 1.2,
    details: `Payload received for ${normalized.slice(0, 48)}`,
  });
  pushTrace(steps, {
    id: 'step-2',
    title: 'API Gateway Ingress',
    service: 'gateway',
    action: 'Route to Write Microservice',
    latencyMs: 2.1,
    details: 'POST /api/urls routed to the write service.',
  });

  let shortCode = '';
  let assignedCounterId = null;
  const alias = sanitizeAlias(customAlias);
  const isCustomAlias = Boolean(alias);

  if (isCustomAlias) {
    if (isReservedSlug(alias)) {
      throw new Error(`Custom alias "${alias}" is reserved. Please choose another.`);
    }
    const existing = await getUrlByCode(alias);
    if (existing) {
      throw new Error(`Custom alias "${alias}" is already taken! Unique constraint failed.`);
    }
    shortCode = alias;
    assignedCounterId = await getCounter();
    pushTrace(steps, {
      id: 'step-3',
      title: 'Custom Alias Verification',
      service: 'write-service',
      action: 'Validate Alias & Uniqueness',
      latencyMs: 1.8,
      details: `Custom alias "${shortCode}" passed uniqueness checks.`,
    });
  } else {
    assignedCounterId = await nextCounterId(simulateBatching, steps);
    shortCode = await allocatePublicSlug();
    const encoding = encodeBase62(assignedCounterId, applyXor);
    pushTrace(steps, {
      id: 'step-4',
      title: 'Public Short Link',
      service: 'write-service',
      action: 'Generate 7-character slug',
      latencyMs: 0.15,
      details: `Issued /${shortCode} (internal id ${assignedCounterId}).`,
      data: { steps: encoding.steps, publicSlug: shortCode },
    });
  }

  const expiresAt = expirationTime ? new Date(expirationTime) : null;
  const inserted = await query(
    `INSERT INTO urls (counter_id, short_code, original_url, custom_alias, created_by, expires_at, xor_applied)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [assignedCounterId, shortCode, normalized, isCustomAlias ? shortCode : null, createdBy, expiresAt, Boolean(applyXor)]
  );
  const row = inserted.rows[0];

  pushTrace(steps, {
    id: 'step-5',
    title: 'Database Commit (PostgreSQL)',
    service: 'database',
    action: 'INSERT INTO urls (...) VALUES (...)',
    latencyMs: 14.5,
    details: `Committed short_code='${shortCode}' for ${createdBy}.`,
  });

  await cacheSet(shortCode, normalized);
  pushTrace(steps, {
    id: 'step-6',
    title: 'Cache Warm in Redis',
    service: 'redis-cache',
    action: `SETEX short:${shortCode} ${config.cacheTtlSeconds}`,
    latencyMs: 1.1,
    details: `Warmed Redis key short:${shortCode}.`,
  });

  const totalLatency = Math.round((performance.now() - started + 20) * 10) / 10;
  pushTrace(steps, {
    id: 'step-7',
    title: 'HTTP 201 Created Response',
    service: 'client',
    action: '201 Created',
    latencyMs: 1.0,
    details: `Short URL generated: /${shortCode} in ~${totalLatency}ms.`,
  });

  return {
    url: await toClientUrl(row),
    trace: {
      id: `trace-${Date.now()}`,
      type: 'write',
      targetCode: shortCode,
      startTime: Date.now(),
      totalLatencyMs: totalLatency,
      steps,
      outcome: `Short URL created successfully: /${shortCode}`,
    },
  };
}

export async function resolveUrl(code, req, { recordClick = true } = {}) {
  const started = performance.now();
  const steps = [];
  const shortCode = String(code || '').trim();

  pushTrace(steps, {
    id: 'step-r1',
    title: 'Client Navigation Request',
    service: 'client',
    action: `GET /${shortCode}`,
    latencyMs: 1.1,
    details: `User requested /${shortCode}.`,
  });
  pushTrace(steps, {
    id: 'step-r2',
    title: 'API Gateway Routing',
    service: 'gateway',
    action: 'Route to Read Microservice',
    latencyMs: 1.5,
    details: 'Redirect traffic dispatched to the read service.',
  });

  const cachedUrl = await cacheGet(shortCode);
  const row = await getUrlByCode(shortCode);
  let originalUrl = cachedUrl;
  const inCache = Boolean(cachedUrl);

  if (inCache) {
    pushTrace(steps, {
      id: 'step-r3',
      title: 'Redis Cache HIT (Hot Path)',
      service: 'redis-cache',
      action: `GET short:${shortCode}`,
      latencyMs: 2.8,
      details: `CACHE HIT for ${originalUrl?.slice(0, 40) || shortCode}.`,
      data: { cacheHit: true },
    });
  } else {
    pushTrace(steps, {
      id: 'step-r3',
      title: 'Redis Cache MISS (Cold Path)',
      service: 'redis-cache',
      action: `GET short:${shortCode}`,
      latencyMs: 3.2,
      details: `Key short:${shortCode} not in Redis.`,
      data: { cacheHit: false },
    });
    if (row) {
      originalUrl = row.original_url;
      await cacheSet(shortCode, originalUrl);
      pushTrace(steps, {
        id: 'step-r4',
        title: 'Database Indexed Lookup (PostgreSQL)',
        service: 'database',
        action: 'SELECT original_url FROM urls WHERE short_code = $1',
        latencyMs: 42.6,
        details: 'Row found and Redis was repopulated.',
      });
    } else {
      pushTrace(steps, {
        id: 'step-r4',
        title: 'Database Lookup (Not Found)',
        service: 'database',
        action: 'SELECT original_url FROM urls WHERE short_code = $1',
        latencyMs: 38.2,
        details: `No record for '${shortCode}'.`,
      });
    }
  }

  const expired = Boolean(row?.expires_at && Date.now() > new Date(row.expires_at).getTime());
  if (expired) {
    pushTrace(steps, {
      id: 'step-r5',
      title: 'Expiration Verification',
      service: 'read-service',
      action: 'Validate Expiration Timestamp',
      latencyMs: 0.2,
      details: `URL expired on ${new Date(row.expires_at).toLocaleString()}.`,
    });
  }

  const elapsed = Math.round((performance.now() - started + (inCache ? 5 : 45)) * 10) / 10;

  if (row && !expired && originalUrl && recordClick) {
    const geo = resolveGeo(req);
    const userAgent = req.headers['user-agent'] || '';
    await query(
      `INSERT INTO click_events (url_id, country, country_code, referrer, device, browser, cache_hit, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        row.id,
        geo.country,
        geo.countryCode,
        req.get?.('referer') || req.headers.referer || 'Direct (Browser)',
        parseDevice(userAgent),
        parseBrowser(userAgent),
        inCache,
        elapsed,
      ]
    );
    await query('UPDATE urls SET clicks = clicks + 1 WHERE id = $1', [row.id]);
    pushTrace(steps, {
      id: 'step-r6',
      title: 'Asynchronous Analytics Event',
      service: 'read-service',
      action: 'Persist ClickEvent',
      latencyMs: 0.8,
      details: `Recorded click from ${geo.country}.`,
    });
    pushTrace(steps, {
      id: 'step-r7',
      title: 'HTTP 302 Found Redirect',
      service: 'client',
      action: `302 Found -> Location: ${originalUrl}`,
      latencyMs: 0.9,
      details: `Redirecting in ${elapsed}ms.`,
    });
  }

  const fresh = row ? await getUrlByCode(shortCode) : null;
  return {
    url: fresh ? await toClientUrl(fresh) : null,
    originalUrl: expired ? null : originalUrl,
    cacheHit: inCache,
    expired,
    latencyMs: elapsed,
    trace: {
      id: `trace-r-${Date.now()}`,
      type: 'read',
      targetCode: shortCode,
      startTime: Date.now(),
      totalLatencyMs: elapsed,
      steps,
      outcome: expired
        ? `HTTP 410 Expired: '${shortCode}' has expired.`
        : fresh
          ? `HTTP 302 Redirecting to ${originalUrl} in ${elapsed}ms (${inCache ? 'Cache HIT' : 'Cache MISS'})`
          : `HTTP 404 Not Found: '${shortCode}' does not exist.`,
    },
  };
}

export async function deleteUrl(id, user) {
  const row = await getUrlById(id);
  if (!row) return false;
  if (!user?.isAdmin && row.created_by !== user?.username) {
    const error = new Error('You can only delete your own URLs.');
    error.status = 403;
    throw error;
  }
  await cacheDel(row.short_code);
  await query('DELETE FROM urls WHERE id = $1', [id]);
  return true;
}

export async function toggleCache(code) {
  const row = await getUrlByCode(code);
  if (!row) return false;
  if (await isCached(code)) {
    await cacheDel(code);
    return false;
  }
  await cacheSet(code, row.original_url);
  return true;
}

export async function purgeCache() {
  if (!isRedisReady()) return;
  const keys = await redis.keys('short:*');
  if (keys.length) await redis.del(keys);
}

export async function warmAllCache() {
  if (!isRedisReady()) return;
  const result = await query('SELECT short_code, original_url FROM urls');
  await Promise.all(result.rows.map((row) => cacheSet(row.short_code, row.original_url)));
}
