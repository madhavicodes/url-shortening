import React, { useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { getPublicShortOrigin } from '../utils/apiClient';
import { deleteShortUrl, resolveShortUrl, toggleUrlCache } from '../utils/urlApi';
import { QrCodeModal } from './QrCodeDisplay';
import { RedirectToast } from './shortener/RedirectToast';
import { ShortenUrlForm } from './shortener/ShortenUrlForm';
import { CreatedUrlCard } from './shortener/CreatedUrlCard';
import { UrlRecordsList } from './shortener/UrlRecordsList';

export const UrlShortenerView = ({
  urls,
  onRefresh,
  onSelectTrace,
  onOpenAnalytics,
  onOpenShare,
  activeGradient,
  onOpenGradients,
  shortDomain = 'sho.rt',
  onSetShortDomain,
  currentUser,
  isAdmin = false,
  onOpenAuth,
  onNavigateTab,
}) => {
  const [createdResult, setCreatedResult] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [qrModal, setQrModal] = useState(null);
  const [redirectToast, setRedirectToast] = useState(null);

  const baseOrigin = getPublicShortOrigin();
  const baseHost = shortDomain || baseOrigin.replace(/^https?:\/\//, '');
  const primaryFrom = activeGradient?.from || '#ff0084';

  const visibleUrls = isAdmin
    ? urls
    : urls.filter((item) => item.createdBy === (currentUser?.username || 'guest_engineer'));

  const handleCopy = async (text, id) => {
    const ok = await copyToClipboard(text);
    if (!ok) return;
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestRedirect = async (shortCode) => {
    const result = await resolveShortUrl(shortCode);
    onSelectTrace(result.trace);
    onRefresh();
    setRedirectToast({
      shortCode,
      targetUrl: result.originalUrl || 'Not Found',
      cacheHit: result.cacheHit,
      latencyMs: result.latencyMs,
      expired: result.expired,
    });
    setTimeout(() => setRedirectToast(null), 6000);
  };

  const handleDelete = async (id) => {
    await deleteShortUrl(id);
    if (createdResult?.id === id) {
      setCreatedResult(null);
    }
    onRefresh();
  };

  return (
    <div className="space-y-8">
      <RedirectToast
        toast={redirectToast}
        baseHost={baseHost}
        activeGradient={activeGradient}
        onClose={() => setRedirectToast(null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <ShortenUrlForm
          activeGradient={activeGradient}
          shortDomain={shortDomain}
          onSetShortDomain={onSetShortDomain}
          currentUser={currentUser}
          isAdmin={isAdmin}
          onOpenAuth={onOpenAuth}
          onNavigateTab={onNavigateTab}
          onCreated={({ url, trace }) => {
            setCreatedResult({ ...url, trace });
            onRefresh();
            onSelectTrace(trace);
          }}
        />

        <div className="lg:col-span-5 space-y-4">
          <CreatedUrlCard
            createdResult={createdResult}
            isAdmin={isAdmin}
            activeGradient={activeGradient}
            baseHost={baseHost}
            baseOrigin={baseOrigin}
            copiedId={copiedId}
            onCopy={handleCopy}
            onOpenQr={(value, label) => setQrModal({ value, label })}
            onSelectTrace={onSelectTrace}
            onNavigateTab={onNavigateTab}
            onTestRedirect={handleTestRedirect}
            onOpenAnalytics={onOpenAnalytics}
            onOpenShare={onOpenShare}
          />

          {isAdmin ? (
            <div
              className="border rounded-2xl p-4 text-xs text-slate-700 space-y-2 bg-white/70"
              style={{ backgroundColor: `${primaryFrom}08`, borderColor: `${primaryFrom}25` }}
            >
              <div className="flex items-center space-x-2 font-bold" style={{ color: primaryFrom }}>
                <Sparkles className="w-4 h-4" />
                <span>Why Redis INCR for the counter?</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Redis executes commands single-threaded, so INCR atomically hands out unique IDs
                and removes race conditions from the write path.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-2.5 bg-slate-50/70">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-[#ff0084]" />
                <span>Short link features</span>
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Real 302 redirects and click analytics stored in Postgres</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Custom aliases, branded prefixes, and QR codes</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <UrlRecordsList
        urls={visibleUrls}
        isAdmin={isAdmin}
        activeGradient={activeGradient}
        baseHost={baseHost}
        baseOrigin={baseOrigin}
        copiedId={copiedId}
        onCopy={handleCopy}
        onRefresh={onRefresh}
        onTestRedirect={handleTestRedirect}
        onOpenAnalytics={onOpenAnalytics}
        onOpenShare={onOpenShare}
        onOpenGradients={onOpenGradients}
        onDelete={handleDelete}
        onToggleCache={async (code) => {
          await toggleUrlCache(code);
          onRefresh();
        }}
      />

      {qrModal && (
        <QrCodeModal
          value={qrModal.value}
          label={qrModal.label}
          activeGradient={activeGradient}
          onClose={() => setQrModal(null)}
        />
      )}
    </div>
  );
};
