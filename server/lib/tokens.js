import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyUserToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
