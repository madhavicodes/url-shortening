import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export function hashPassword(plain) {
  return bcrypt.hash(String(plain), ROUNDS);
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(String(plain), String(hash));
}
