import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { optionalAuth } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { urlsRouter } from './routes/urls.js';
import { resolveUrl } from './services/urlService.js';

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

export const app = express();

const allowedOrigins = new Set(
  [
    config.appUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
  ].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(optionalAuth);

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, service: 'shortscale-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/urls', urlsRouter);

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

async function handleRedirect(req, res) {
  const result = await resolveUrl(req.params.code, req, { recordClick: true });
  if (result.expired) {
    return res.status(410).type('html').send(expiredPage(req.params.code));
  }
  if (!result.originalUrl) {
    return res.status(404).type('html').send(notFoundPage(req.params.code));
  }
  return res.redirect(302, result.originalUrl);
}

app.get('/go/:code', handleRedirect);
app.get('/r/:code', handleRedirect);
app.get('/:code', (req, res, next) => {
  if (req.params.code === 'api' || req.params.code === 'assets' || req.params.code.includes('.')) {
    return next();
  }
  return handleRedirect(req, res);
});

function notFoundPage(code) {
  return `<!doctype html><html><body style="font-family:sans-serif;padding:40px">
    <h1>404 — Short link not found</h1>
    <p><code>/${escapeHtml(code)}</code> does not exist.</p>
    <p><a href="${config.appUrl}">Back to ShortScale</a></p>
  </body></html>`;
}

function expiredPage(code) {
  return `<!doctype html><html><body style="font-family:sans-serif;padding:40px">
    <h1>410 — This short link has expired</h1>
    <p><code>/${escapeHtml(code)}</code> is no longer active.</p>
    <p><a href="${config.appUrl}">Back to ShortScale</a></p>
  </body></html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});
