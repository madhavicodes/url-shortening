import { app } from '../server/app.js';
import { ensureReady } from '../server/boot.js';

export default async function handler(req, res) {
  await ensureReady();
  const code = typeof req.query?.code === 'string' ? req.query.code : '';
  if (code) {
    req.url = `/${code}`;
  }
  return app(req, res);
}
