import { encodeBase62 } from './base62';
import { createPublicSlug } from './shortCode';

const STORAGE_KEY = 'sys_url_shortener_urls_v2';
const COUNTER_KEY = 'sys_url_shortener_counter_v2';

const COUNTRIES = [
  { country: 'United States', countryCode: 'US' },
  { country: 'Germany', countryCode: 'DE' },
  { country: 'Japan', countryCode: 'JP' },
  { country: 'United Kingdom', countryCode: 'GB' },
  { country: 'India', countryCode: 'IN' },
  { country: 'Canada', countryCode: 'CA' },
  { country: 'France', countryCode: 'FR' },
  { country: 'Brazil', countryCode: 'BR' },
  { country: 'Australia', countryCode: 'AU' },
  { country: 'Singapore', countryCode: 'SG' },
];

const REFERRERS = [
  'Direct (Browser)',
  'https://twitter.com/x',
  'https://linkedin.com/feed',
  'https://slack.com',
  'https://google.com/search',
  'https://news.ycombinator.com',
  'https://reddit.com/r/programming',
];

const DEVICES = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Mobile', 'Tablet'];
const BROWSERS = ['Chrome 124', 'Safari 17.4', 'Firefox 125', 'Edge 124', 'Mobile Safari'];

// Initial seeds
const INITIAL_COUNTER = 1000000000; // 1 Billion start

export const INITIAL_URLS = [
  {
    id: 'seed-1',
    counterId: 1000000000,
    shortCode: 'linux-src', // readable public slug
    originalUrl: 'https://github.com/torvalds/linux',
    creationTime: Date.now() - 86400000 * 3, // 3 days ago
    expirationTime: null,
    createdBy: 'system-admin',
    customAlias: null,
    clicks: 1428,
    cached: true,
    xorApplied: false,
    clickEvents: [
      {
        id: 'c1',
        timestamp: Date.now() - 3600000 * 2,
        country: 'United States',
        countryCode: 'US',
        referrer: 'https://news.ycombinator.com',
        device: 'Desktop',
        browser: 'Chrome 124',
        cacheHit: true,
        latencyMs: 4.2,
      },
      {
        id: 'c2',
        timestamp: Date.now() - 3600000 * 5,
        country: 'Germany',
        countryCode: 'DE',
        referrer: 'https://twitter.com/x',
        device: 'Mobile',
        browser: 'Mobile Safari',
        cacheHit: true,
        latencyMs: 3.8,
      },
      {
        id: 'c3',
        timestamp: Date.now() - 3600000 * 12,
        country: 'Japan',
        countryCode: 'JP',
        referrer: 'Direct (Browser)',
        device: 'Desktop',
        browser: 'Firefox 125',
        cacheHit: false,
        latencyMs: 46.1,
      },
      {
        id: 'c4',
        timestamp: Date.now() - 3600000 * 24,
        country: 'United Kingdom',
        countryCode: 'GB',
        referrer: 'https://linkedin.com/feed',
        device: 'Desktop',
        browser: 'Chrome 124',
        cacheHit: true,
        latencyMs: 5.1,
      },
    ],
  },
  {
    id: 'seed-2',
    counterId: 1000000001,
    shortCode: 'wiki-base62',
    originalUrl: 'https://en.wikipedia.org/wiki/Base62',
    creationTime: Date.now() - 86400000 * 2,
    expirationTime: null,
    createdBy: 'alice_dev',
    customAlias: 'wiki-base62',
    clicks: 842,
    cached: true,
    xorApplied: false,
    clickEvents: [
      {
        id: 'c5',
        timestamp: Date.now() - 1800000,
        country: 'United States',
        countryCode: 'US',
        referrer: 'https://google.com/search',
        device: 'Desktop',
        browser: 'Chrome 124',
        cacheHit: true,
        latencyMs: 3.5,
      },
      {
        id: 'c6',
        timestamp: Date.now() - 7200000,
        country: 'India',
        countryCode: 'IN',
        referrer: 'https://slack.com',
        device: 'Mobile',
        browser: 'Chrome 124',
        cacheHit: true,
        latencyMs: 6.2,
      },
    ],
  },
  {
    id: 'seed-3',
    counterId: 1000000002,
    shortCode: 'redis-incr',
    originalUrl: 'https://redis.io/docs/latest/commands/incr/',
    creationTime: Date.now() - 86400000,
    expirationTime: Date.now() + 86400000 * 14, // 14 days left
    createdBy: 'bob_user',
    customAlias: 'redis-incr',
    clicks: 310,
    cached: false,
    xorApplied: false,
    clickEvents: [
      {
        id: 'c7',
        timestamp: Date.now() - 3600000 * 4,
        country: 'Canada',
        countryCode: 'CA',
        referrer: 'https://slack.com',
        device: 'Desktop',
        browser: 'Edge 124',
        cacheHit: false,
        latencyMs: 52.4,
      },
    ],
  },
];

export class SystemSimulator {
  constructor() {
    this.urls = [];
    this.counter = INITIAL_COUNTER;
    this.cache = new Map(); // key: shortCode, value: originalUrl
    this.batchPool = [];
    this.batchSize = 1000;
    this.isBatchingEnabled = false;

    this.loadState();
  }

  loadState() {
    try {
      const savedUrls = localStorage.getItem(STORAGE_KEY);
      if (savedUrls) {
        this.urls = JSON.parse(savedUrls);
      } else {
        this.urls = [...INITIAL_URLS];
        this.saveState();
      }

      const savedCounter = localStorage.getItem(COUNTER_KEY);
      if (savedCounter) {
        this.counter = parseInt(savedCounter, 10) || INITIAL_COUNTER;
      } else {
        this.counter = INITIAL_COUNTER + this.urls.length;
        localStorage.setItem(COUNTER_KEY, this.counter.toString());
      }

      // Populate cache with items marked as cached
      this.urls.forEach(u => {
        if (u.cached) {
          this.cache.set(u.shortCode, u.originalUrl);
        }
      });
    } catch {
      this.urls = [...INITIAL_URLS];
      this.counter = INITIAL_COUNTER + 3;
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.urls));
      localStorage.setItem(COUNTER_KEY, this.counter.toString());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  getUrls() {
    return [...this.urls];
  }

  getCounter() {
    return this.counter;
  }

  getCacheSize() {
    return this.cache.size;
  }

  isCodeInCache(code) {
    return this.cache.has(code);
  }

  toggleCache(code) {
    const url = this.urls.find(u => u.shortCode === code);
    if (!url) return false;

    if (this.cache.has(code)) {
      this.cache.delete(code);
      url.cached = false;
    } else {
      this.cache.set(code, url.originalUrl);
      url.cached = true;
    }
    this.saveState();
    return url.cached;
  }

  purgeCache() {
    this.cache.clear();
    this.urls.forEach(u => {
      u.cached = false;
    });
    this.saveState();
  }

  warmAllCache() {
    this.urls.forEach(u => {
      this.cache.set(u.shortCode, u.originalUrl);
      u.cached = true;
    });
    this.saveState();
  }

  setBatching(enabled, size = 1000) {
    this.isBatchingEnabled = enabled;
    this.batchSize = size;
    if (!enabled) {
      this.batchPool = [];
    }
  }

  getBatchInfo() {
    return {
      enabled: this.isBatchingEnabled,
      poolRemaining: this.batchPool.length,
      size: this.batchSize,
    };
  }

  /**
   * Simulates Write Flow:
   * Client POST /urls -> Gateway -> Write Service -> Redis INCR (atomic counter) -> Base62 encode -> DB save -> Cache warm -> Client response
   */
  async shortenUrl(params) {
    const startTime = performance.now();
    const traceSteps = [];

    // Normalize URL
    let originalUrl = params.originalUrl.trim();
    if (!/^https?:\/\//i.test(originalUrl)) {
      originalUrl = 'https://' + originalUrl;
    }

    const createdBy = params.createdBy?.trim() || 'guest_engineer';
    const expirationTime = params.expirationTime ?? null;
    const applyXor = !!params.applyXor;

    // Step 1: Client sends request
    traceSteps.push({
      id: 'step-1',
      title: 'Client Request Sent',
      service: 'client',
      action: 'POST /urls HTTP/1.1',
      latencyMs: 1.2,
      status: 'completed',
      details: `Payload: { originalUrl: "${originalUrl.slice(0, 35)}...", alias: "${params.customAlias || 'none'}" }`,
    });

    // Step 2: API Gateway routing
    traceSteps.push({
      id: 'step-2',
      title: 'API Gateway Ingress',
      service: 'gateway',
      action: 'Route to Write Microservice',
      latencyMs: 2.1,
      status: 'completed',
      details: 'Evaluated route rules: POST /urls routed to Write Service cluster instance [write-svc-pod-04].',
    });

    let shortCode = '';
    let assignedCounterId = 0;
    const isCustomAlias = !!params.customAlias && params.customAlias.trim().length > 0;

    if (isCustomAlias) {
      const sanitized = params.customAlias.trim().replace(/[^a-zA-Z0-9-_]/g, '');
      if (!sanitized) {
        throw new Error('Custom alias contains only invalid characters.');
      }
      // Check collision
      const existing = this.urls.find(u => u.shortCode.toLowerCase() === sanitized.toLowerCase());
      if (existing) {
        throw new Error(`Custom alias "${sanitized}" is already taken! Unique constraint failed.`);
      }
      shortCode = sanitized;
      assignedCounterId = this.counter; // reference current

      traceSteps.push({
        id: 'step-3',
        title: 'Custom Alias Verification',
        service: 'write-service',
        action: 'Validate Alias & Uniqueness',
        latencyMs: 1.8,
        status: 'completed',
        details: `Custom alias "${shortCode}" passed format checks and DB unique index verification.`,
      });
    } else {
      // Redis Counter Increment
      let redisLatency = 0.9;
      let redisDetails = '';

      if (params.simulateBatching) {
        if (this.batchPool.length === 0) {
          // Fetch batch from Redis via INCRBY
          const batchStart = this.counter + 1;
          this.counter += 1000;
          for (let i = 0; i < 1000; i++) {
            this.batchPool.push(batchStart + i);
          }
          assignedCounterId = this.batchPool.shift();
          redisLatency = 1.8;
          redisDetails = `Local batch exhausted. Executed Redis atomic INCRBY 1000 (Range: ${batchStart} to ${this.counter}). Reserved locally.`;
        } else {
          assignedCounterId = this.batchPool.shift();
          redisLatency = 0.05; // In-memory local memory pool!
          redisDetails = `Counter Batching Active: Used next ID from Write Service local memory pool (${this.batchPool.length} remaining). Zero network hop to Redis!`;
        }
      } else {
        // Direct Redis single-threaded INCR
        this.counter += 1;
        assignedCounterId = this.counter;
        redisLatency = 0.85;
        redisDetails = `Executed Redis atomic INCR global_url_counter -> returned value ${assignedCounterId}. Single-threaded atomic guarantee prevents collisions.`;
      }

      traceSteps.push({
        id: 'step-3',
        title: 'Redis Atomic Counter Increment',
        service: 'redis-counter',
        action: params.simulateBatching ? 'INCRBY 1000 (Batched)' : 'INCR global_url_counter',
        latencyMs: redisLatency,
        status: 'completed',
        details: redisDetails,
        data: { counterId: assignedCounterId },
      });

      // Step 4: Base62 encode
      const encoding = encodeBase62(assignedCounterId, applyXor);
      shortCode = createPublicSlug(7);

      traceSteps.push({
        id: 'step-4',
        title: 'Public Short Link',
        service: 'write-service',
        action: 'Generate 7-character slug',
        latencyMs: 0.15,
        status: 'completed',
        details: `Issued /${shortCode} as a 7-character public slug. Internal id ${assignedCounterId}.`,
        data: { steps: encoding.steps },
      });
    }

    // Step 5: Database Commit
    const newUrl = {
      id: 'url-' + Math.random().toString(36).substring(2, 9),
      counterId: assignedCounterId,
      shortCode,
      originalUrl,
      creationTime: Date.now(),
      expirationTime,
      createdBy,
      customAlias: isCustomAlias ? shortCode : null,
      clicks: 0,
      clickEvents: [],
      cached: true, // we warm cache on write
      xorApplied: applyXor,
    };

    traceSteps.push({
      id: 'step-5',
      title: 'Database Commit (PostgreSQL)',
      service: 'database',
      action: 'INSERT INTO urls (...) VALUES (...)',
      latencyMs: 14.5,
      status: 'completed',
      details: `Committed row (~500 bytes) with UNIQUE index on short_code. Fields: shortCode='${shortCode}', originalUrl='${originalUrl.slice(0, 30)}...', createdBy='${createdBy}'.`,
    });

    // Step 6: Cache Warm
    this.cache.set(shortCode, originalUrl);
    traceSteps.push({
      id: 'step-6',
      title: 'Cache Warm in Redis',
      service: 'redis-cache',
      action: `SETEX short:${shortCode} 604800 "${originalUrl.slice(0, 25)}..."`,
      latencyMs: 1.1,
      status: 'completed',
      details: `Seeded Redis in-memory cache with key 'short:${shortCode}' to ensure ultra-fast future 302 redirects (< 10ms).`,
    });

    // Step 7: Response to Client
    const totalLatency = Math.round((performance.now() - startTime + 20) * 10) / 10;
    traceSteps.push({
      id: 'step-7',
      title: 'HTTP 201 Created Response',
      service: 'client',
      action: '201 Created',
      latencyMs: 1.0,
      status: 'completed',
      details: `Short URL generated: /${shortCode}. Complete write flow finished in ~${totalLatency}ms.`,
    });

    this.urls.unshift(newUrl);
    this.saveState();

    const trace = {
      id: 'trace-' + Date.now(),
      type: 'write',
      targetCode: shortCode,
      startTime: Date.now(),
      totalLatencyMs: totalLatency,
      steps: traceSteps,
      outcome: `Short URL created successfully: /${shortCode}`,
    };

    return { url: newUrl, trace };
  }

  /**
   * Simulates Read Flow (GET /{short_code}):
   * Client -> Gateway -> Read Service -> Redis Cache check -> DB query if Miss -> Async Analytics -> 302 Found redirect
   */
  async resolveUrl(shortCode, referrerInput) {
    const startTime = performance.now();
    const traceSteps = [];

    // Step 1: Client GET request
    traceSteps.push({
      id: 'step-r1',
      title: 'Client Navigation Request',
      service: 'client',
      action: `GET /${shortCode} HTTP/1.1`,
      latencyMs: 1.1,
      status: 'completed',
      details: `User requested shortened link /${shortCode}. Follow redirect instructed.`,
    });

    // Step 2: Gateway routing to Read Service
    traceSteps.push({
      id: 'step-r2',
      title: 'API Gateway Routing',
      service: 'gateway',
      action: 'Route to Read Microservice',
      latencyMs: 1.5,
      status: 'completed',
      details: `High-frequency redirect traffic: Dispatched to Read Service pool [read-svc-node-12].`,
    });

    // Step 3: Check Redis Cache
    const inCache = this.cache.has(shortCode);
    let originalUrl = null;
    let urlRecord = this.urls.find(u => u.shortCode === shortCode);
    let isExpired = false;

    if (inCache) {
      originalUrl = this.cache.get(shortCode);
      traceSteps.push({
        id: 'step-r3',
        title: 'Redis Cache HIT (Hot Path)',
        service: 'redis-cache',
        action: `GET short:${shortCode}`,
        latencyMs: 2.8,
        status: 'completed',
        details: `CACHE HIT! Found mapping in memory. Direct resolution: ${originalUrl.slice(0, 35)}... Bypassed database completely!`,
        data: { cacheHit: true, key: `short:${shortCode}` },
      });
    } else {
      traceSteps.push({
        id: 'step-r3',
        title: 'Redis Cache MISS (Cold Path)',
        service: 'redis-cache',
        action: `GET short:${shortCode}`,
        latencyMs: 3.2,
        status: 'completed',
        details: `Key 'short:${shortCode}' not found in in-memory cache. Evicted or expired. Falling back to persistent Database.`,
        data: { cacheHit: false },
      });

      // Step 4: Database Lookup
      if (urlRecord) {
        originalUrl = urlRecord.originalUrl;
        traceSteps.push({
          id: 'step-r4',
          title: 'Database Indexed Lookup (PostgreSQL)',
          service: 'database',
          action: `SELECT original_url, expiration_time FROM urls WHERE short_code = '${shortCode}' LIMIT 1`,
          latencyMs: 42.6,
          status: 'completed',
          details: `Queried database using B-tree index on short_code. Query took 42.6ms. Row found. Populating Redis cache for subsequent calls.`,
        });

        // Repopulate Cache
        this.cache.set(shortCode, originalUrl);
        urlRecord.cached = true;
      } else {
        traceSteps.push({
          id: 'step-r4',
          title: 'Database Lookup (Not Found)',
          service: 'database',
          action: `SELECT original_url FROM urls WHERE short_code = '${shortCode}'`,
          latencyMs: 38.2,
          status: 'completed',
          details: `No record matching short code '${shortCode}' exists in the database.`,
        });
      }
    }

    // Step 5: Check Expiration
    if (urlRecord && urlRecord.expirationTime && Date.now() > urlRecord.expirationTime) {
      isExpired = true;
      traceSteps.push({
        id: 'step-r5',
        title: 'Expiration Verification',
        service: 'read-service',
        action: 'Validate Expiration Timestamp',
        latencyMs: 0.2,
        status: 'completed',
        details: `URL has expired on ${new Date(urlRecord.expirationTime).toLocaleString()}! HTTP 410 Gone.`,
      });
    }

    const elapsed = Math.round((performance.now() - startTime + (inCache ? 5 : 45)) * 10) / 10;

    if (urlRecord && !isExpired && originalUrl) {
      // Step 6: Async Analytics ingestion (doesn't block redirect)
      const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const randomDevice = DEVICES[Math.floor(Math.random() * DEVICES.length)];
      const randomBrowser = BROWSERS[Math.floor(Math.random() * BROWSERS.length)];
      const referrer = referrerInput || REFERRERS[Math.floor(Math.random() * REFERRERS.length)];

      const clickEvent = {
        id: 'click-' + Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        country: randomCountry.country,
        countryCode: randomCountry.countryCode,
        referrer,
        device: randomDevice,
        browser: randomBrowser,
        cacheHit: inCache,
        latencyMs: elapsed,
      };

      urlRecord.clicks += 1;
      urlRecord.clickEvents.unshift(clickEvent);
      // Keep max 50 recent events
      if (urlRecord.clickEvents.length > 50) {
        urlRecord.clickEvents.pop();
      }
      this.saveState();

      traceSteps.push({
        id: 'step-r6',
        title: 'Asynchronous Analytics Kafka/Event Log',
        service: 'read-service',
        action: 'Emit ClickEvent to Queue',
        latencyMs: 0.8,
        status: 'completed',
        details: `Published click event (Geo: ${randomCountry.country}, Device: ${randomDevice}) to message broker asynchronously. Did not delay 302 redirect.`,
      });

      traceSteps.push({
        id: 'step-r7',
        title: 'HTTP 302 Found Redirect',
        service: 'client',
        action: '302 Found -> Location: ' + originalUrl,
        latencyMs: 0.9,
        status: 'completed',
        details: `Returned 302 Found with header Location: ${originalUrl}. Total turnaround time: ${elapsed}ms (<100ms SLA met!).`,
      });
    }

    const trace = {
      id: 'trace-r-' + Date.now(),
      type: 'read',
      targetCode: shortCode,
      startTime: Date.now(),
      totalLatencyMs: elapsed,
      steps: traceSteps,
      outcome: isExpired
        ? `HTTP 410 Expired: '${shortCode}' has expired.`
        : urlRecord
        ? `HTTP 302 Redirecting to ${originalUrl} in ${elapsed}ms (${inCache ? 'Cache HIT' : 'Cache MISS'})`
        : `HTTP 404 Not Found: '${shortCode}' does not exist.`,
    };

    return {
      url: urlRecord || null,
      originalUrl,
      cacheHit: inCache,
      expired: isExpired,
      latencyMs: elapsed,
      trace,
    };
  }

  deleteUrl(id) {
    const target = this.urls.find(u => u.id === id);
    if (target) {
      this.cache.delete(target.shortCode);
      this.urls = this.urls.filter(u => u.id !== id);
      this.saveState();
    }
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COUNTER_KEY);
    this.cache.clear();
    this.urls = [...INITIAL_URLS];
    this.counter = INITIAL_COUNTER + 3;
    this.urls.forEach(u => {
      if (u.cached) this.cache.set(u.shortCode, u.originalUrl);
    });
    this.saveState();
  }
}

export const simulator = new SystemSimulator();
