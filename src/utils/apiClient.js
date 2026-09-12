const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getPublicShortOrigin() {
  const fromEnv = String(import.meta.env.VITE_SHORT_ORIGIN || '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}

export function getShortLink(shortCode) {
  return `${getPublicShortOrigin()}/${shortCode}`;
}

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return payload;
}
