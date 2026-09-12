import { app } from '../server/app.js';
import { ensureReady } from '../server/boot.js';

export default async function handler(req, res) {
  await ensureReady();
  return app(req, res);
}
