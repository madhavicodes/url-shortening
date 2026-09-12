import { describe, expect, it } from 'vitest';
import { normalizeUrl, sanitizeAlias, toPublicUser } from './mappers.js';

describe('normalizeUrl', () => {
  it('adds https when the protocol is missing', () => {
    expect(normalizeUrl('example.com/docs')).toBe('https://example.com/docs');
  });

  it('rejects an empty value', () => {
    expect(() => normalizeUrl('')).toThrow(/valid destination/i);
  });
});

describe('sanitizeAlias', () => {
  it('strips illegal characters', () => {
    expect(sanitizeAlias('My Alias!')).toBe('MyAlias');
  });
});

describe('toPublicUser', () => {
  it('never includes a password hash', () => {
    const user = toPublicUser({
      id: '1',
      username: 'alice_dev',
      email: 'a@b.com',
      password_hash: 'secret',
      full_name: 'Alice',
      role: 'Standard User',
      role_type: 'user',
      is_admin: false,
    });
    expect(user.password).toBeUndefined();
    expect(user.password_hash).toBeUndefined();
    expect(user.username).toBe('alice_dev');
  });
});
