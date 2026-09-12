import { describe, expect, it } from 'vitest';
import { hashPassword, isHashedPassword, sanitizeUser } from './password';

describe('password helpers', () => {
  it('hashes a password to 64 hex characters', async () => {
    const hash = await hashPassword('password123');
    expect(isHashedPassword(hash)).toBe(true);
    expect(hash).toBe('ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');
  });

  it('strips password from a user object', () => {
    const safe = sanitizeUser({ username: 'alice_dev', password: 'secret', roleType: 'user' });
    expect(safe.username).toBe('alice_dev');
    expect(safe.password).toBeUndefined();
  });
});
