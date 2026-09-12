import { beforeEach, describe, expect, it } from 'vitest';
import { SystemSimulator } from './systemSimulator';

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, String(value));
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
  };
}

describe('SystemSimulator', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage();
  });

  it('normalizes URLs and stores a short code', async () => {
    const simulator = new SystemSimulator();
    const { url, trace } = await simulator.shortenUrl({
      originalUrl: 'example.com/docs',
      createdBy: 'bob_user',
    });

    expect(url.originalUrl).toBe('https://example.com/docs');
    expect(url.shortCode.length).toBeGreaterThan(0);
    expect(url.createdBy).toBe('bob_user');
    expect(trace.type).toBe('write');
  });

  it('rejects a colliding custom alias', async () => {
    const simulator = new SystemSimulator();
    await expect(
      simulator.shortenUrl({
        originalUrl: 'https://example.com',
        customAlias: 'wiki-base62',
        createdBy: 'alice_dev',
      })
    ).rejects.toThrow(/already taken/i);
  });

  it('resolves a seeded short code', async () => {
    const simulator = new SystemSimulator();
    const result = await simulator.resolveUrl('wiki-base62');
    expect(result.expired).toBe(false);
    expect(result.originalUrl).toContain('wikipedia.org');
    expect(result.trace.type).toBe('read');
  });
});
