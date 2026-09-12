const COUNTRIES = [
  { country: 'United States', countryCode: 'US' },
  { country: 'India', countryCode: 'IN' },
  { country: 'Germany', countryCode: 'DE' },
  { country: 'United Kingdom', countryCode: 'GB' },
];

export function parseDevice(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (ua.includes('ipad') || ua.includes('tablet')) return 'Tablet';
  if (ua.includes('mobi')) return 'Mobile';
  return 'Desktop';
}

export function parseBrowser(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('safari/') && !ua.includes('chrome/')) return 'Safari';
  if (ua.includes('chrome/')) return 'Chrome';
  return 'Unknown';
}

export function resolveGeo(req) {
  const code = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'];
  if (code && typeof code === 'string' && code !== 'XX') {
    return { country: code, countryCode: code };
  }
  return { country: 'Local', countryCode: 'LO' };
}

export function fallbackGeo() {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}
