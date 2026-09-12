import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getCssGradient } from '../utils/gradients';

export function QrCodeDisplay({ value, size = 192, fgColor = '#1e293b', className = '' }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!value) {
      setDataUrl('');
      setError('Nothing to encode.');
      return undefined;
    }

    let cancelled = false;
    setError(null);

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: fgColor, light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'QR generation failed');
      });

    return () => {
      cancelled = true;
    };
  }, [value, size, fgColor]);

  if (error) {
    return <p className="text-xs text-rose-600">{error}</p>;
  }

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      className={`mx-auto ${className}`}
    />
  );
}

export function QrCodeModal({ value, label, activeGradient, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
        <h3 className="font-bold text-lg text-slate-900">QR Code</h3>
        <p className="text-xs text-slate-500">Scan with a camera app to open this link</p>

        <div className="w-52 h-52 mx-auto bg-slate-50 p-3 border border-slate-200 rounded-xl flex items-center justify-center">
          <QrCodeDisplay value={value} size={196} fgColor={activeGradient?.from || '#1e293b'} />
        </div>

        {label && (
          <div
            className="font-mono text-xs font-bold py-1 px-3 rounded-lg inline-block"
            style={{
              backgroundColor: `${activeGradient?.from || '#ff0084'}15`,
              color: activeGradient?.from || '#ff0084',
            }}
          >
            {label}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          style={{ background: getCssGradient(activeGradient) }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
