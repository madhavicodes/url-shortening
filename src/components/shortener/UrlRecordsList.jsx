import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Facebook,
  Palette,
  Search,
  Share2,
  Trash2,
  Twitter,
  Zap,
} from 'lucide-react';
import { getCssGradient } from '../../utils/gradients';
import { shareOnFacebook, shareOnTwitter } from '../../utils/socialShare';

export function UrlRecordsList({
  urls,
  isAdmin,
  activeGradient,
  baseHost,
  baseOrigin,
  copiedId,
  onCopy,
  onRefresh,
  onTestRedirect,
  onOpenAnalytics,
  onOpenShare,
  onOpenGradients,
  onDelete,
  onToggleCache,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const now = Date.now();
  const primaryFrom = activeGradient?.from || '#ff0084';

  const filteredUrls = urls.filter((item) => {
    const matchesSearch =
      item.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const isExpired = item.expirationTime !== null && item.expirationTime < now;
    if (statusFilter === 'active') return !isExpired;
    if (statusFilter === 'expired') return isExpired;
    if (statusFilter === 'cached') return item.cached;
    return true;
  });

  const handleToggleCache = (code) => {
    if (onToggleCache) onToggleCache(code);
  };

  const renderActions = (item, itemFullUrl) => (
    <div className="flex items-center justify-end space-x-1">
      <button
        type="button"
        onClick={() => shareOnTwitter(itemFullUrl, `Check out this link: ${itemFullUrl}`)}
        className="p-1.5 text-slate-400 hover:text-[#1DA1F2] hover:bg-sky-50 rounded-lg"
        title="Share on Twitter"
      >
        <Twitter className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => shareOnFacebook(itemFullUrl)}
        className="p-1.5 text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 rounded-lg"
        title="Share on Facebook"
      >
        <Facebook className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onOpenShare(item)}
        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
        title="More share and QR options"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onTestRedirect(item.shortCode)}
        className="px-2 py-1 rounded-lg text-xs font-semibold text-white flex items-center space-x-1"
        style={{ background: getCssGradient(activeGradient) }}
      >
        <span>Redirect</span>
        <ArrowRight className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => onOpenAnalytics(item)}
        className="p-1.5 text-slate-500 hover:text-[#ff0084] hover:bg-rose-50 rounded-lg"
        title="Analytics"
      >
        <BarChart3 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
        title="Delete URL"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/15 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Active URLs ({filteredUrls.length})</h3>
            <p className="text-xs text-white/70">
              {isAdmin
                ? 'Inspect records, toggle cache, and open analytics'
                : 'Manage your shortened links, copy URLs, and inspect click statistics'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenGradients}
            className="inline-flex items-center self-start sm:self-auto space-x-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            <Palette className="w-3.5 h-3.5 text-[#ff0084]" />
            <span>Theme gradients</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search short code or URL..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="glass-input w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex rounded-lg border border-white/20 p-0.5 bg-white/10 text-xs">
              {['all', 'active', 'expired', 'cached'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium ${
                    statusFilter === filter ? 'text-white font-semibold' : 'text-white/70 hover:text-white'
                  }`}
                  style={statusFilter === filter ? { background: getCssGradient(activeGradient) } : {}}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden divide-y divide-slate-100">
        {filteredUrls.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No shortened URLs match the current filter.</div>
        ) : (
          filteredUrls.map((item) => {
            const isExpired = item.expirationTime !== null && item.expirationTime < now;
            const itemFullUrl = `${baseOrigin}/${item.shortCode}`;
            return (
              <div key={`mobile-${item.id}`} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <span
                      className="font-mono font-bold text-sm truncate hover:underline cursor-pointer"
                      style={{ color: primaryFrom }}
                      onClick={() => onTestRedirect(item.shortCode)}
                    >
                      {baseHost}/{item.shortCode}
                    </span>
                    <button type="button" onClick={() => onCopy(itemFullUrl, item.id)} className="text-slate-400 p-1">
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-600 truncate">
                  <a href={item.originalUrl} target="_blank" rel="noreferrer" className="hover:underline" style={{ color: primaryFrom }}>
                    {item.originalUrl}
                  </a>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {item.clicks.toLocaleString()} clicks
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {item.expirationTime ? (isExpired ? 'Expired' : new Date(item.expirationTime).toLocaleDateString()) : 'Never expires'}
                    </span>
                  </span>
                </div>
                {renderActions(item, itemFullUrl)}
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs text-white/80">
          <thead className="bg-white/5 text-white font-semibold uppercase tracking-wider border-b border-white/15">
            <tr>
              <th className="py-3 px-4">Short link</th>
              <th className="py-3 px-4">Destination</th>
              {isAdmin && <th className="py-3 px-4">Cache</th>}
              <th className="py-3 px-4">Clicks</th>
              <th className="py-3 px-4">Expiration</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUrls.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-400">
                  No shortened URLs match the current filter.
                </td>
              </tr>
            ) : (
              filteredUrls.map((item) => {
                const isExpired = item.expirationTime !== null && item.expirationTime < now;
                const itemFullUrl = `${baseOrigin}/${item.shortCode}`;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span
                          className="hover:underline cursor-pointer font-bold"
                          style={{ color: primaryFrom }}
                          onClick={() => onTestRedirect(item.shortCode)}
                        >
                          {baseHost}/{item.shortCode}
                        </span>
                        <button type="button" onClick={() => onCopy(itemFullUrl, item.id)} className="text-slate-400 p-1">
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate" title={item.originalUrl}>
                      <a
                        href={item.originalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center space-x-1"
                        style={{ color: primaryFrom }}
                      >
                        <span className="truncate">{item.originalUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </a>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleCache(item.shortCode)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            item.cached
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>{item.cached ? 'Redis cached' : 'DB only'}</span>
                        </button>
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{item.clicks.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      {item.expirationTime ? (
                        <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {isExpired ? 'Expired' : new Date(item.expirationTime).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">Never</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">{renderActions(item, itemFullUrl)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
