import { config } from '../config.js';
import { query } from '../db.js';
import { toPublicUser } from '../lib/mappers.js';
import { verifyUserToken } from '../lib/tokens.js';

export async function optionalAuth(req, _res, next) {
  try {
    const token = req.cookies?.[config.cookieName];
    if (!token) {
      req.user = null;
      return next();
    }
    const payload = verifyUserToken(token);
    const result = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [payload.sub]);
    req.user = toPublicUser(result.rows[0]);
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}
