export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    roleType: row.role_type,
    isAdmin: row.is_admin,
    organization: row.organization,
    bio: row.bio,
    avatarColor: row.avatar_color,
    initials: row.initials,
    joinedDate: row.joined_at
      ? new Date(row.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
    plan: row.plan,
  };
}

export function toPublicUrl(row, options = {}) {
  if (!row) return null;
  const events = options.clickEvents || row.click_events || [];
  return {
    id: row.id,
    counterId: row.counter_id == null ? null : Number(row.counter_id),
    shortCode: row.short_code,
    originalUrl: row.original_url,
    creationTime: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    expirationTime: row.expires_at ? new Date(row.expires_at).getTime() : null,
    createdBy: row.created_by,
    customAlias: row.custom_alias,
    clicks: row.clicks || 0,
    cached: Boolean(options.cached),
    xorApplied: Boolean(row.xor_applied),
    clickEvents: events.map((event) => ({
      id: event.id,
      timestamp: event.occurred_at ? new Date(event.occurred_at).getTime() : Date.now(),
      country: event.country,
      countryCode: event.country_code,
      referrer: event.referrer,
      device: event.device,
      browser: event.browser,
      cacheHit: event.cache_hit,
      latencyMs: event.latency_ms,
    })),
  };
}

export function normalizeUrl(input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) {
    throw new Error('Please enter a valid destination URL.');
  }
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http and https URLs are allowed.');
  }
  return parsed.toString();
}

export function sanitizeAlias(alias) {
  if (!alias) return '';
  return String(alias).trim().replace(/[^a-zA-Z0-9-_]/g, '');
}
