import React from 'react';
import { BarChart3, Check, CheckCircle2, Copy, Facebook, Network, QrCode, Share2, Sparkles, Twitter, Zap } from 'lucide-react';
import { getCssGradient } from '../../utils/gradients';
import { shareOnFacebook, shareOnTwitter } from '../../utils/socialShare';

export function CreatedUrlCard({
  createdResult,
  isAdmin,
  activeGradient,
  baseHost,
  baseOrigin,
  copiedId,
  onCopy,
  onOpenQr,
  onSelectTrace,
  onNavigateTab,
  onTestRedirect,
  onOpenAnalytics,
  onOpenShare,
}) {
  const primaryFrom = activeGradient?.from || '#ff0084';

  if (!createdResult) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center py-10 min-h-[200px]">
        <div
          className="w-12 h-12 rounded-2xl border flex items-center justify-center mb-3"
          style={{ background: `${primaryFrom}1a`, borderColor: `${primaryFrom}40`, color: primaryFrom }}
        >
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-slate-100">Ready to shorten</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Enter any URL to simulate counter allocation, Base62 encoding, and cache warming.
        </p>
      </div>
    );
  }

  const shortUrl = `${baseOrigin}/${createdResult.shortCode}`;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden ring-1 ring-white/5">
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-30"
        style={{ background: getCssGradient(activeGradient) }}
      />

      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span>201 Created</span>
        </span>
        {isAdmin && (
          <span className="text-[11px] text-slate-400 font-mono">Assigned ID: #{createdResult.counterId}</span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs text-slate-400 font-medium">Short link</span>
          <div className="mt-1 flex items-center justify-between p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span
              className="font-mono text-base font-bold truncate mr-2 text-transparent bg-clip-text"
              style={{ backgroundImage: getCssGradient(activeGradient) }}
            >
              {baseHost}/{createdResult.shortCode}
            </span>
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={() => onCopy(shortUrl, 'new')}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                title="Copy to clipboard"
              >
                {copiedId === 'new' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => onOpenQr(shortUrl, `${baseHost}/${createdResult.shortCode}`)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                title="Show QR code"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1 text-xs">
          <div className="text-slate-400 truncate">
            <span className="text-slate-500">Destination:</span> {createdResult.originalUrl}
          </div>
          {isAdmin ? (
            <>
              <div className="flex justify-between text-slate-400">
                <span>Base62 length</span>
                <span className="text-white font-mono">{createdResult.shortCode.length} characters</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status</span>
                <span className="text-emerald-400 font-medium">Warm in Redis cache</span>
              </div>
              {createdResult.trace && (
                <div className="pt-2 mt-1 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTrace(createdResult.trace);
                      onNavigateTab('architecture');
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-purple-500/40"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Inspect architecture trace</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between text-slate-400">
              <span>Status</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => shareOnTwitter(shortUrl, `Check out this link: ${shortUrl}`)}
            className="py-2 px-2.5 rounded-xl bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
          >
            <Twitter className="w-3.5 h-3.5 fill-current" />
            <span>Twitter</span>
          </button>
          <button
            type="button"
            onClick={() => shareOnFacebook(shortUrl)}
            className="py-2 px-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs flex items-center justify-center space-x-1.5"
          >
            <Facebook className="w-3.5 h-3.5 fill-current" />
            <span>Facebook</span>
          </button>
        </div>

        <div className="pt-2 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onTestRedirect(createdResult.shortCode)}
            className="flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs text-white flex items-center justify-center space-x-1.5"
            style={{ background: getCssGradient(activeGradient) }}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Test 302 redirect</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAnalytics(createdResult)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenShare(createdResult)}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="More sharing options"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
