import { connectRedis } from '../server/redis.js';
import { migrate } from '../server/migrate.js';
import { resolveUrl } from '../server/services/urlService.js';

let ready;

async function ensureReady() {
  if (!ready) {
    ready = (async () => {
      await migrate();
      await connectRedis();
    })();
  }
  await ready;
}

export default async function handler(req, res) {
  await ensureReady();
  const code = req.query.code;
  if (!code) {
    res.statusCode = 400;
    res.end('Missing short code');
    return;
  }
  req.params = { ...(req.params || {}), code };
  const result = await resolveUrl(code, req, { recordClick: true });
  if (result.expired) {
    res.statusCode = 410;
    res.setHeader('Content-Type', 'text/plain');
    res.end('This short link has expired.');
    return;
  }
  if (!result.originalUrl) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Short link not found.');
    return;
  }
  res.statusCode = 302;
  res.setHeader('Location', result.originalUrl);
  res.end();
}
