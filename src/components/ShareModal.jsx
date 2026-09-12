import React, { useState } from 'react';
import { shareOnTwitter, shareOnFacebook } from '../utils/socialShare';
import { getCssGradient } from '../utils/gradients';
import { copyToClipboard } from '../utils/clipboard';
import { getPublicShortOrigin } from '../utils/apiClient';
import { QrCodeDisplay } from './QrCodeDisplay';
import {
  X,
  Share2,
  Twitter,
  Facebook,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';

export const ShareModal = ({
  urlRecord,
  activeGradient,
  shortDomain = 'sho.rt',
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const baseOrigin = getPublicShortOrigin();
  const baseHost = shortDomain || baseOrigin.replace(/^https?:\/\//, '');

  const shortUrl = urlRecord
    ? `${baseOrigin}/${urlRecord.shortCode}`
    : typeof window !== 'undefined'
    ? window.location.href
    : '';

  const destination = urlRecord ? urlRecord.originalUrl : 'ShortScale Distributed URL Shortener';

  const defaultTweetText = urlRecord
    ? `Check out this link shortened with ShortScale: ${shortUrl}`
    : `ShortScale: Scalable URL Shortener System Design Lab (1B URLs, 100M DAU) ${shortUrl}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(shortUrl);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    shareOnTwitter(shortUrl, defaultTweetText);
  };

  const handleFacebookShare = () => {
    shareOnFacebook(shortUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div
              className="p-2 rounded-xl text-white shadow-md"
              style={{ background: getCssGradient(activeGradient) }}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Share Shortened Link</h3>
              <p className="text-xs text-slate-500">Post directly to Twitter & Facebook</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Preview Box */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Short URL to Share
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold text-slate-900 truncate mr-2">
              {shortUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              title="Copy short link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {urlRecord && (
            <p className="text-[11px] text-slate-500 truncate">
              Destination: {destination}
            </p>
          )}
        </div>

        {/* Social Share Action Buttons */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            One-Click Social Platforms
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Share on Twitter */}
            <button
              onClick={handleTwitterShare}
              className="w-full py-3 px-4 rounded-xl bg-[#1DA1F2] hover:bg-[#1a91da] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>Share on Twitter</span>
            </button>

            {/* Share on Facebook */}
            <button
              onClick={handleFacebookShare}
              className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>Share on Facebook</span>
            </button>
          </div>
        </div>

        {/* Quick Actions (QR Code & Copy) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowQr(!showQr)}
            className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? 'Hide QR Code' : 'Show QR Code'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Optional QR Display */}
        {showQr && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
            <QrCodeDisplay value={shortUrl} size={160} fgColor={activeGradient?.from || '#1e293b'} />
            <p className="text-[11px] text-slate-500 font-mono">{baseHost}/{urlRecord?.shortCode || ''}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            style={{ background: getCssGradient(activeGradient) }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
