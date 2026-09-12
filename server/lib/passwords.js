import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(String(plain), ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  try {
    return await bcrypt.compare(String(plain), String(hash));
  } catch {
    return false;
  }
}
