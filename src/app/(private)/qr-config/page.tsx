import { getDbData } from '@/lib/db';
import { QrCode, Info, RefreshCw } from 'lucide-react';
import { updateQrSettings, regenerateQrToken } from '@/app/actions/settings';

// To use QRCodeCanvas safely in a Server Component we would usually extract it to a Client Component,
// but for the MVP since we need to render the settings form which is a Server Action, we will extract the QR logic to a Client Component or just make the whole page a Client Component?
// Server Actions work in Server Components too using forms.
// We'll use a Client component wrapper for the QR rendering only.

import { QrDisplay } from './QrDisplay';
import { RegenerateTokenButton } from './RegenerateTokenButton';

export default async function QrConfigPage() {
  const data = await getDbData();
  const settings = data.qrSettings;
  const qrToken = data.dog.publicQrToken || data.dog.id; // fallback for safety

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <QrCode className="text-teal-600" /> Código QR
          </h1>
          <p className="text-gray-500 text-sm mt-1">Configura qué información pública compartes en emergencias.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <QrDisplay qrToken={qrToken} />
          
          <form action={regenerateQrToken} className="bg-white rounded-xl shadow-sm border border-red-100 p-4">
            <h3 className="font-bold text-red-800 text-sm mb-1 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Regenerar Token Público
            </h3>
            <p className="text-xs text-red-600 mb-3">
              Si cambias el token, los códigos QR impresos anteriormente dejarán de funcionar para siempre.
            </p>
            <RegenerateTokenButton />
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3">
            <Info className="text-blue-500 w-6 h-6 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h3 className="font-bold mb-1">Configuración de Privacidad</h3>
              <p className="mb-2 text-blue-700">Elige qué datos podrán ver otras personas si escanean este código QR.</p>
            </div>
          </div>

          <form action={updateQrSettings} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-800">Habilitar QR Público</p>
                <p className="text-xs text-gray-500">Si lo desactivas, nadie podrá ver la ficha de tu mascota.</p>
              </div>
              <input type="checkbox" name="enabled" defaultChecked={settings.enabled} className="w-5 h-5 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar alergias</span>
              <input type="checkbox" name="showAllergies" defaultChecked={settings.showAllergies} className="w-4 h-4 accent-teal-600" />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar enfermedades crónicas</span>
              <input type="checkbox" name="showConditions" defaultChecked={settings.showConditions} className="w-4 h-4 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar tratamientos activos</span>
              <input type="checkbox" name="showActiveTreatments" defaultChecked={settings.showActiveTreatments} className="w-4 h-4 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar vacunas principales</span>
              <input type="checkbox" name="showVaccines" defaultChecked={settings.showVaccines} className="w-4 h-4 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar contacto del tutor/a</span>
              <input type="checkbox" name="showOwnerContact" defaultChecked={settings.showOwnerContact} className="w-4 h-4 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Mostrar notas de emergencia</span>
              <input type="checkbox" name="showEmergencyNotes" defaultChecked={settings.showEmergencyNotes} className="w-4 h-4 accent-teal-600" />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <span className="text-sm text-gray-700">Mostrar alimento</span>
                <p className="text-xs text-gray-400">Muestra marca de alimento, ración diaria y horarios en el QR.</p>
              </div>
              <input type="checkbox" name="showFood" defaultChecked={settings.showFood} className="w-4 h-4 accent-teal-600" />
            </div>

            <button type="submit" className="w-full bg-gray-100 hover:bg-teal-600 hover:text-white text-gray-700 font-medium py-2 rounded-lg transition-colors text-sm mt-4">
              Guardar Configuración
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
