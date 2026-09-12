import { Router } from 'express';
import { config } from '../config.js';
import { query } from '../db.js';
import { sendOtpEmail } from '../lib/mailer.js';
import { toPublicUser } from '../lib/mappers.js';
import { hashPassword, verifyPassword } from '../lib/passwords.js';
import { cookieOptions, signUserToken } from '../lib/tokens.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

function issueSession(res, user) {
  res.cookie(config.cookieName, signUserToken(user), cookieOptions());
  return user;
}

function parseRegisterInput(body) {
  const fullName = String(body?.fullName || '').trim();
  const username = String(body?.username || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '').trim();
  return { fullName, username, email, password };
}

function validateRegisterInput({ fullName, username, email, password }) {
  if (!fullName) return 'Please provide your full name.';
  if (username.length < 3) return 'Username must be at least 3 characters (letters, numbers, underscores).';
  if (!email.includes('@') || !email.includes('.')) return 'Please provide a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters long.';
  return null;
}

async function createStandardUser({ fullName, username, email, passwordHash }) {
  const parts = fullName.split(' ').filter(Boolean);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : fullName.slice(0, 2).toUpperCase();
  const colors = [
    'from-rose-500 to-purple-600',
    'from-amber-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-indigo-600',
  ];

  const inserted = await query(
    `INSERT INTO users (username, email, password_hash, full_name, role, role_type, is_admin, organization, bio, avatar_color, initials, plan)
     VALUES ($1, $2, $3, $4, 'Standard User', 'user', FALSE, NULL, NULL, $5, $6, 'Standard User')
     RETURNING *`,
    [username, email, passwordHash, fullName, colors[Math.floor(Math.random() * colors.length)], initials]
  );
  return toPublicUser(inserted.rows[0]);
}

authRouter.post('/register', async (req, res) => {
  try {
    const input = parseRegisterInput(req.body);
    const validationError = validateRegisterInput(input);
    if (validationError) return res.status(400).json({ error: validationError });

    const existing = await query('SELECT username, email FROM users WHERE username = $1 OR email = $2', [
      input.username,
      input.email,
    ]);
    if (existing.rows.some((row) => row.username === input.username)) {
      return res.status(409).json({ error: `Username "@${input.username}" is already taken. Please choose another.` });
    }
    if (existing.rows.some((row) => row.email === input.email)) {
      return res.status(409).json({ error: `An account with email "${input.email}" already exists. Please log in.` });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    await query('DELETE FROM email_otps WHERE email = $1 OR expires_at < NOW()', [input.email]);
    await query(
      `INSERT INTO email_otps (email, username, full_name, password_hash, code_hash, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '10 minutes')`,
      [input.email, input.username, input.fullName, await hashPassword(input.password), await hashPassword(code)]
    );

    const sendResult = await sendOtpEmail(input.email, code);
    const payload = {
      sent: true,
      email: input.email,
      message: sendResult.delivered
        ? `A 6-digit code was sent to ${input.email}.`
        : `A 6-digit code was generated for ${input.email}. Set EMAIL_USER and EMAIL_PASSWORD to send it with Gmail.`,
    };
    if (config.emailDevEcho && !sendResult.delivered) {
      payload.devCode = code;
    }
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Register OTP failed:', error);
    return res.status(500).json({
      error: error.message?.includes('does not exist')
        ? 'Database tables are missing. Restart the API so it can run migrations.'
        : error.message || 'Could not send verification code.',
    });
  }
});

authRouter.post('/register/verify', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const code = String(req.body?.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Enter the 6-digit code sent to your email.' });
    }

    const pending = await query(
      'SELECT * FROM email_otps WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
      [email]
    );
    const row = pending.rows[0];
    if (!row || new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'This code has expired. Request a new one.' });
    }
    if (!(await verifyPassword(code, row.code_hash))) {
      return res.status(400).json({ error: 'Incorrect verification code.' });
    }

    const existing = await query('SELECT id FROM users WHERE username = $1 OR email = $2', [row.username, row.email]);
    if (existing.rows[0]) {
      await query('DELETE FROM email_otps WHERE email = $1', [email]);
      return res.status(409).json({ error: 'An account with that username or email already exists. Please log in.' });
    }

    const user = await createStandardUser({
      fullName: row.full_name,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
    });
    await query('DELETE FROM email_otps WHERE email = $1', [email]);
    return res.status(201).json({ user: issueSession(res, user) });
  } catch (error) {
    console.error('Register verify failed:', error);
    return res.status(500).json({ error: error.message || 'Could not verify email.' });
  }
});

authRouter.post('/login', async (req, res) => {
  const identifier = String(req.body?.usernameOrEmail || req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  if (!identifier) return res.status(400).json({ error: 'Please enter your username or email address.' });
  if (!password) return res.status(400).json({ error: 'Please enter your password.' });

  const result = await query('SELECT * FROM users WHERE username = $1 OR email = $1 LIMIT 1', [identifier]);
  const row = result.rows[0];
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  return res.json({ user: issueSession(res, toPublicUser(row)) });
});

authRouter.post('/demo', async (req, res) => {
  if (!config.demoLoginEnabled) {
    return res.status(403).json({ error: 'Demo login is disabled.' });
  }
  const username = String(req.body?.username || '').trim().toLowerCase();
  const allowed = ['alice_dev', 'bob_user', 'system-admin'];
  if (!allowed.includes(username)) {
    return res.status(400).json({ error: 'Unknown demo account.' });
  }
  const result = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
  if (!result.rows[0]) {
    return res.status(404).json({ error: 'Demo account is not seeded. Run npm run db:seed.' });
  }
  return res.json({ user: issueSession(res, toPublicUser(result.rows[0])) });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(config.cookieName, { ...cookieOptions(), maxAge: 0 });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.get('/demo-accounts', (_req, res) => {
  res.json({
    accounts: [
      { username: 'alice_dev', fullName: 'Alice Developer', isAdmin: false, roleType: 'user' },
      { username: 'bob_user', fullName: 'Bob Martinez', isAdmin: false, roleType: 'user' },
      { username: 'system-admin', fullName: 'System Administrator', isAdmin: true, roleType: 'admin' },
    ],
  });
});

authRouter.patch('/me', requireAuth, async (req, res) => {
  const fullName = String(req.body?.fullName || req.user.fullName).trim();
  const role = String(req.body?.role || req.user.role).trim();
  const organization = String(req.body?.organization || req.user.organization || '').trim();
  const bio = String(req.body?.bio || req.user.bio || '').trim();
  const result = await query(
    `UPDATE users
     SET full_name = $1, role = $2, organization = $3, bio = $4
     WHERE id = $5
     RETURNING *`,
    [fullName, role, organization, bio, req.user.id]
  );
  res.json({ user: toPublicUser(result.rows[0]) });
});
