import React, { useState } from 'react';
import { Clock, Globe, Layers, Link2, Shield, Sparkles } from 'lucide-react';
import { getCssGradient } from '../../utils/gradients';
import { createShortUrl } from '../../utils/urlApi';
import { getPublicShortOrigin } from '../../utils/apiClient';

function calculateExpirationTimestamp(expirationOption, customExpirationDate) {
  const now = Date.now();
  switch (expirationOption) {
    case '1h':
      return now + 60 * 60 * 1000;
    case '24h':
      return now + 24 * 60 * 60 * 1000;
    case '7d':
      return now + 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return now + 30 * 24 * 60 * 60 * 1000;
    case 'custom':
      return customExpirationDate ? new Date(customExpirationDate).getTime() : null;
    default:
      return null;
  }
}

export function ShortenUrlForm({
  activeGradient,
  shortDomain,
  onSetShortDomain,
  currentUser,
  isAdmin,
  onOpenAuth,
  onNavigateTab,
  onCreated,
}) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expirationOption, setExpirationOption] = useState('never');
  const [customExpirationDate, setCustomExpirationDate] = useState('');
  const [applyXor, setApplyXor] = useState(false);
  const [enableBatching, setEnableBatching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const liveHost = getPublicShortOrigin().replace(/^https?:\/\//, '');
  const baseHost = shortDomain || liveHost;
  const primaryFrom = activeGradient?.from || '#ff0084';

  const handleCreate = async (event) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!originalUrl.trim()) {
      setErrorMessage('Please enter a valid destination URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createShortUrl({
        originalUrl,
        customAlias: customAlias.trim() || undefined,
        expirationTime: calculateExpirationTimestamp(expirationOption, customExpirationDate),
        applyXor,
        simulateBatching: enableBatching,
      });
      setOriginalUrl('');
      setCustomAlias('');
      onCreated(result);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred shortening URL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-7">
      <div className="flex items-center space-x-3 mb-5">
        <div
          className="p-2.5 rounded-xl text-white shadow-sm"
          style={{ background: getCssGradient(activeGradient) }}
        >
          <Link2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Shorten a destination URL</h2>
          <p className="text-sm text-white/70">
            {isAdmin
              ? 'Generates a unique 7-character short link, with Redis counter traces for the system-design lab'
              : 'Enter any long destination link to generate a clean short URL like bit.ly'}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="bg-white/10 border border-white/20 rounded-xl p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Short domain prefix
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/15 text-white border border-white/20">
                Active: {baseHost}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: liveHost, label: liveHost, badge: 'Live' },
              { id: 'sho.rt', label: 'sho.rt', badge: 'Brand' },
              { id: 'lnk.to', label: 'lnk.to', badge: 'Popular' },
              { id: 'min.link', label: 'min.link', badge: 'Clean' },
            ].map((preset) => {
              const isSelected = baseHost === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSetShortDomain && onSetShortDomain(preset.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-white font-bold'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
            Destination long URL
          </label>
          <input
            type="text"
            id="input-long-url"
            placeholder="https://example.com/very/long/deep/linked/resource/path"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            className="glass-input w-full px-4 py-3 border rounded-xl placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff0084] text-sm font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Custom alias (optional)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-xs text-white/60 font-semibold select-none">
                {baseHost}/
              </span>
              <input
                type="text"
                id="input-custom-alias"
                placeholder="my-alias"
                value={customAlias}
                onChange={(event) => setCustomAlias(event.target.value)}
                className="glass-input w-full pl-20 pr-3 py-2.5 border rounded-xl placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff0084] text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
              Assigned creator
            </label>
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-xl flex items-center justify-between min-h-[42px]">
              {currentUser ? (
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className={`w-5 h-5 rounded-md bg-gradient-to-tr ${
                      currentUser.avatarColor || 'from-pink-500 to-rose-600'
                    } text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                  >
                    {currentUser.initials || 'U'}
                  </div>
                  <span className="text-xs font-bold text-white truncate">@{currentUser.username}</span>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab && onNavigateTab('dashboard')}
                      className="text-[10px] text-[#ff0084] hover:underline font-bold"
                    >
                      Dashboard
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-white/70 font-medium">Guest</span>
                  <button
                    type="button"
                    onClick={() => onOpenAuth && onOpenAuth('login')}
                    className="text-[11px] font-bold text-[#ff0084] hover:underline cursor-pointer"
                  >
                    Sign in to save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-white/70" />
            <span>Link expiration</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'never', label: 'Never' },
              { id: '1h', label: '1 Hour' },
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'custom', label: 'Custom' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExpirationOption(opt.id)}
                className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all ${
                  expirationOption === opt.id
                    ? 'border-white text-white bg-white/20 font-bold'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {expirationOption === 'custom' && (
            <div className="mt-2">
              <input
                type="datetime-local"
                value={customExpirationDate}
                onChange={(event) => setCustomExpirationDate(event.target.value)}
                className="px-3 py-2 text-xs border rounded-lg glass-input focus:outline-none focus:ring-2 focus:ring-[#ff0084]"
              />
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              System design mechanics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyXor}
                  onChange={(event) => setApplyXor(event.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#ff0084] focus:ring-[#ff0084]"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#ff0084]" />
                    <span className="text-xs font-semibold text-slate-800">XOR secret masking</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Prevents predictable sequential code guessing.
                  </p>
                </div>
              </label>
              <label className="flex items-start space-x-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBatching}
                  onChange={(event) => setEnableBatching(event.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#ff0084] focus:ring-[#ff0084]"
                />
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#ff0084]" />
                    <span className="text-xs font-semibold text-slate-800">Counter batching</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Reserves 1,000 IDs locally to reduce counter round-trips.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          style={{ background: getCssGradient(activeGradient) }}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSubmitting ? 'Generating short URL...' : 'Create shortened URL'}</span>
        </button>
      </form>
    </div>
  );
}
