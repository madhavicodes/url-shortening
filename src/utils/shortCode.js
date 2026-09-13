export const PUBLIC_SLUG_ALPHABET = 'abcdefghijkmnopqrstuvwxyz23456789';
export const PUBLIC_SLUG_LENGTH = 7;

const RESERVED_SLUGS = new Set([
  'api',
  'assets',
  'auth',
  'admin',
  'dashboard',
  'go',
  'health',
  'login',
  'me',
  'r',
  'static',
  'urls',
  'www',
]);

export function isReservedSlug(code) {
  return RESERVED_SLUGS.has(String(code || '').trim().toLowerCase());
}

export function createPublicSlug(length = PUBLIC_SLUG_LENGTH) {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => PUBLIC_SLUG_ALPHABET[byte % PUBLIC_SLUG_ALPHABET.length]).join('');
}
