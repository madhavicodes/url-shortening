import { describe, expect, it } from 'vitest';
import { isUserAdmin } from './authService';

describe('isUserAdmin', () => {
  it('returns false without a user', () => {
    expect(isUserAdmin(null)).toBe(false);
  });

  it('returns true for admin accounts', () => {
    expect(isUserAdmin({ isAdmin: true, roleType: 'admin' })).toBe(true);
  });

  it('returns false for standard users', () => {
    expect(isUserAdmin({ isAdmin: false, roleType: 'user' })).toBe(false);
  });
});
