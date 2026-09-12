import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getCssGradient } from '../../utils/gradients';

export function RedirectToast({ toast, baseHost, activeGradient, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 text-white animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              toast.expired ? 'bg-rose-500' : toast.cacheHit ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="font-bold text-sm">
            {toast.expired ? 'HTTP 410 Gone' : 'HTTP 302 Found (Redirect)'}
          </span>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xs">
          Close
        </button>
      </div>

      <div className="mt-2 space-y-1 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Short link</span>
          <span className="font-mono text-amber-200 font-semibold">
            {baseHost}/{toast.shortCode}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Resolution</span>
          <span className={`font-semibold ${toast.cacheHit ? 'text-emerald-400' : 'text-amber-400'}`}>
            {toast.cacheHit ? 'Redis cache hit' : 'Postgres miss'}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Latency</span>
          <span className="font-mono font-bold text-white">{toast.latencyMs} ms</span>
        </div>
        <div className="truncate pt-1 text-slate-300 border-t border-slate-800">
          <span className="text-slate-400">Location:</span> {toast.targetUrl}
        </div>
      </div>

      {!toast.expired && toast.targetUrl.startsWith('http') && (
        <div className="mt-3 pt-2 border-t border-slate-800 flex justify-end">
          <a
            href={toast.targetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium text-white"
            style={{ background: getCssGradient(activeGradient) }}
          >
            <span>Follow original URL</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
