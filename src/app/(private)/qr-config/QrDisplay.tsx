'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Link as LinkIcon } from 'lucide-react';

export function QrDisplay({ qrToken }: { qrToken: string }) {
  // Build the URL on the client safely (no useEffect + setState)
  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${qrToken}`
    : `/qr/${qrToken}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
      <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm mb-6">
        <QRCodeCanvas
          value={qrUrl}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-gray-600 text-center text-sm mb-4">
        Escanea este código para acceder a la vista pública de la ficha médica.
      </p>
      <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg w-full overflow-hidden border border-gray-200">
        <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 truncate">{qrUrl}</span>
      </div>
      <a
        href={qrUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-teal-600 font-medium text-sm hover:underline"
      >
        Abrir enlace en nueva pestaña
      </a>
    </div>
  );
}
