'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Link as LinkIcon, Copy, Share2, Check, ExternalLink } from 'lucide-react';
import { useState, useCallback } from 'react';

export function QrDisplay({ qrToken, dogName }: { qrToken: string; dogName?: string }) {
  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${qrToken}`
    : `/qr/${qrToken}`;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [qrUrl]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title: dogName ? `Ficha de ${dogName}` : 'PetCare QR',
        text: dogName ? `Ficha médica de ${dogName}` : 'Ficha médica',
        url: qrUrl,
      });
    }
  }, [qrUrl, dogName]);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
      {/* QR code */}
      <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm mb-4">
        <QRCodeCanvas
          value={qrUrl}
          size={220}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="text-gray-500 text-sm text-center mb-4 px-2">
        Escanea este código para ver la ficha pública de tu mascota en emergencias.
      </p>

      {/* URL display */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-xl w-full mb-3 overflow-hidden">
        <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 truncate flex-1">{qrUrl}</span>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
        <button
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
          }`}
        >
          {copied ? (
            <><Check className="w-4 h-4" /> ¡Copiado!</>
          ) : (
            <><Copy className="w-4 h-4" /> Copiar enlace</>
          )}
        </button>

        {canShare ? (
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Compartir
          </button>
        ) : (
          <a
            href={qrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Abrir QR
          </a>
        )}
      </div>
    </div>
  );
}
