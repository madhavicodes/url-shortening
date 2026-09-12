import React from 'react';
import { getCssGradient } from '../utils/gradients';
import { shareOnTwitter, shareOnFacebook } from '../utils/socialShare';
import {
  X,
  BarChart3,
  Globe,
  Smartphone,
  Zap,
  Clock,
  ExternalLink,
  Shield,
  Activity,
  Twitter,
  Facebook,
  Share2,
} from 'lucide-react';

export const AnalyticsModal = ({ url, onClose, activeGradient, shortDomain = 'sho.rt', onOpenShare }) => {
  if (!url) return null;

  const primaryFrom = activeGradient?.from || '#ff0084';
  const primaryTo = activeGradient?.to || '#33001b';

  // Aggregate stats
  const totalClicks = url.clicks;
  const events = url.clickEvents || [];

  const cacheHits = events.filter((e) => e.cacheHit).length;
  const cacheHitRate = events.length > 0 ? Math.round((cacheHits / events.length) * 100) : 85;

  const avgLatency =
    events.length > 0
      ? Math.round(
          (events.reduce((acc, curr) => acc + curr.latencyMs, 0) / events.length) * 10
        ) / 10
      : 6.4;

  // Group by country
  const countryCounts = {};
  events.forEach((e) => {
    if (!countryCounts[e.country]) {
      countryCounts[e.country] = { count: 0, code: e.countryCode };
    }
    countryCounts[e.country].count += 1;
  });

  const topCountries = Object.entries(countryCounts)
    .map(([country, data]) => ({ country, ...data }))
    .sort((a, b) => b.count - a.count);

  // Group by referrer
  const referrerCounts = {};
  events.forEach((e) => {
    referrerCounts[e.referrer] = (referrerCounts[e.referrer] || 0) + 1;
  });

  const topReferrers = Object.entries(referrerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const baseHost = shortDomain || 'sho.rt';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className="font-mono text-xl font-extrabold"
                style={{ color: primaryFrom }}
              >
                {baseHost}/{url.shortCode}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                style={{
                  backgroundColor: `${primaryFrom}15`,
                  color: primaryFrom,
                  borderColor: `${primaryFrom}30`,
                }}
              >
                #{url.counterId}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md mt-1">
              Destination: {url.originalUrl}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-600">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-slate-500 font-medium">Total Clicks</div>
              <div className="font-mono text-2xl font-bold text-slate-900 mt-0.5">
                {totalClicks.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-emerald-700 font-medium flex items-center justify-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Cache Hit Rate</span>
              </div>
              <div className="font-mono text-2xl font-bold text-emerald-800 mt-0.5">
                {cacheHitRate}%
              </div>
            </div>

            <div
              className="p-4 rounded-xl border text-center"
              style={{
                backgroundColor: `${primaryFrom}0a`,
                borderColor: `${primaryFrom}25`,
              }}
            >
              <div
                className="font-medium flex items-center justify-center space-x-1"
                style={{ color: primaryFrom }}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Avg 302 Latency</span>
              </div>
              <div
                className="font-mono text-2xl font-bold mt-0.5"
                style={{ color: primaryFrom }}
              >
                {avgLatency} ms
              </div>
            </div>
          </div>

          {/* Geo & Referrer Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Geographic Distribution */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-800">
                <Globe className="w-4 h-4" style={{ color: primaryFrom }} />
                <span>Geographic Clicks</span>
              </div>

              {topCountries.length === 0 ? (
                <div className="text-slate-400 py-3 text-center">No geo events logged yet.</div>
              ) : (
                <div className="space-y-2">
                  {topCountries.map((c) => (
                    <div key={c.country} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {c.code}
                        </span>
                        <span className="text-slate-700 font-medium">{c.country}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referrers */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-800">
                <Activity className="w-4 h-4" style={{ color: primaryFrom }} />
                <span>Traffic Sources</span>
              </div>

              {topReferrers.length === 0 ? (
                <div className="text-slate-400 py-3 text-center">No referrers logged yet.</div>
              ) : (
                <div className="space-y-2">
                  {topReferrers.map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 truncate max-w-[170px]" title={r.name}>
                        {r.name.replace('https://', '')}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Event Log Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">Recent 302 Redirection Access Logs</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Origin</th>
                    <th className="py-2 px-3">Device</th>
                    <th className="py-2 px-3">Resolution</th>
                    <th className="py-2 px-3 text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 font-sans">
                        No click events recorded yet. Click "Test 302 Redirect" on the main table to generate live traffic!
                      </td>
                    </tr>
                  ) : (
                    events.slice(0, 15).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 text-slate-500 font-sans">
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-1.5 px-3 text-slate-700 font-sans">
                          {e.country} ({e.countryCode})
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 font-sans">{e.device}</td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              e.cacheHit
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {e.cacheHit ? 'Cache HIT' : 'DB Miss'}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right text-slate-900 font-bold">
                          {e.latencyMs}ms
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            {/* Direct Share on Twitter */}
            <button
              onClick={() => {
                const itemFullUrl = `https://${baseHost}/${url.shortCode}`;
                shareOnTwitter(itemFullUrl, `Link analytics for ${baseHost}/${url.shortCode}: ${totalClicks} total clicks!`);
              }}
              className="py-1.5 px-3 bg-[#1DA1F2] hover:bg-[#1a91da] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5 fill-current" />
              <span>Share on Twitter</span>
            </button>

            {/* Direct Share on Facebook */}
            <button
              onClick={() => {
                const itemFullUrl = `https://${baseHost}/${url.shortCode}`;
                shareOnFacebook(itemFullUrl);
              }}
              className="py-1.5 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Facebook className="w-3.5 h-3.5 fill-current" />
              <span>Share on Facebook</span>
            </button>

            {onOpenShare && (
              <button
                onClick={() => {
                  onClose();
                  onOpenShare(url);
                }}
                className="py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors"
                title="Open share modal with QR code"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>More Share</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            style={{ background: getCssGradient(activeGradient) }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
