import { apiRequest } from './apiClient';

export async function fetchUrls() {
  const data = await apiRequest('/api/urls');
  return data.urls || [];
}

export async function fetchStats() {
  try {
    return await apiRequest('/api/urls/stats');
  } catch {
    return { counter: 0, cacheCount: 0 };
  }
}

export function createShortUrl(params) {
  return apiRequest('/api/urls', { method: 'POST', body: params });
}

export function resolveShortUrl(shortCode) {
  return apiRequest(`/api/urls/${encodeURIComponent(shortCode)}/resolve`, { method: 'POST' });
}

export function deleteShortUrl(id) {
  return apiRequest(`/api/urls/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function toggleUrlCache(shortCode) {
  return apiRequest(`/api/urls/${encodeURIComponent(shortCode)}/cache`, { method: 'POST' });
}

export function fetchUrlDetails(shortCode) {
  return apiRequest(`/api/urls/${encodeURIComponent(shortCode)}`);
}
