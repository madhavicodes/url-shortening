import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import {
  deleteUrl,
  getCacheSize,
  getCounter,
  getUrlByCode,
  listUrls,
  purgeCache,
  resolveUrl,
  shortenUrl,
  toClientUrl,
  toggleCache,
} from '../services/urlService.js';

export const urlsRouter = Router();

urlsRouter.get('/', async (req, res) => {
  const urls = await listUrls({ user: req.user, search: req.query.search });
  res.json({ urls });
});

urlsRouter.get('/stats', requireAdmin, async (_req, res) => {
  const [counter, cacheCount] = await Promise.all([getCounter(), getCacheSize()]);
  res.json({ counter, cacheCount });
});

urlsRouter.get('/:code', async (req, res) => {
  const row = await getUrlByCode(req.params.code);
  if (!row) return res.status(404).json({ error: 'Short URL not found.' });
  if (!req.user?.isAdmin && req.user?.username !== row.created_by) {
    return res.status(404).json({ error: 'Short URL not found.' });
  }
  res.json({ url: await toClientUrl(row) });
});

urlsRouter.post('/', async (req, res) => {
  try {
    const result = await shortenUrl({
      originalUrl: req.body?.originalUrl,
      customAlias: req.body?.customAlias,
      expirationTime: req.body?.expirationTime ?? null,
      createdBy: req.user?.username || 'guest',
      applyXor: Boolean(req.body?.applyXor) && Boolean(req.user?.isAdmin),
      simulateBatching: Boolean(req.body?.simulateBatching) && Boolean(req.user?.isAdmin),
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not shorten URL.' });
  }
});

urlsRouter.post('/:code/resolve', async (req, res) => {
  const result = await resolveUrl(req.params.code, req, { recordClick: true });
  if (!result.url && !result.expired) {
    return res.status(404).json(result);
  }
  if (result.expired) {
    return res.status(410).json(result);
  }
  res.json(result);
});

urlsRouter.post('/:code/cache', requireAdmin, async (req, res) => {
  const cached = await toggleCache(req.params.code);
  res.json({ cached });
});

urlsRouter.delete('/cache', requireAdmin, async (_req, res) => {
  await purgeCache();
  res.status(204).end();
});

urlsRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await deleteUrl(req.params.id, req.user);
    if (!deleted) return res.status(404).json({ error: 'Short URL not found.' });
    res.status(204).end();
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
});
