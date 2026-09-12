/**
 * SHA-256 password hashing for the client-only demo store.
 * This is not a substitute for a real backend (no salt, no slow KDF).
 */
export async function hashPassword(plain) {
  const normalized = String(plain ?? '');
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function isHashedPassword(value) {
  return typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}
