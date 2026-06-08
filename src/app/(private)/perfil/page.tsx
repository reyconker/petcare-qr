import { getDbData } from '@/lib/db';
import { EditProfileButton } from './ProfileForms';
import { AlertTriangle, Scissors, Stethoscope } from 'lucide-react';

export default async function PerfilPage() {
  const { dog } = await getDbData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Profile */}
        <div className="bg-teal-600 h-32 relative"></div>
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative shadow-md">
              {dog.photoUrl ? (
                <img src={dog.photoUrl} alt={`Foto de ${dog.name}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sin Foto</div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{dog.name}</h1>
              <p className="text-gray-500">{dog.species} • {dog.breed} • {dog.gender} • {dog.ageText}</p>
            </div>
            <div className="sm:self-start sm:mt-20">
              <EditProfileButton dog={dog} />
            </div>
          </div>

          {/* ── Emergency Notes — prominent card ── */}
          {dog.emergencyNotes && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-1">⚠ Notas de Emergencia</h2>
                <p className="text-sm text-red-700 whitespace-pre-wrap">{dog.emergencyNotes}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Datos Básicos */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Datos Básicos</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Especie</span>
                  <span className="col-span-2 text-gray-800">{dog.species}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Raza</span>
                  <span className="col-span-2 text-gray-800">{dog.breed || '—'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Peso</span>
                  <span className="col-span-2 text-gray-800">{dog.weight} kg</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Color</span>
                  <span className="col-span-2 text-gray-800">{dog.color || '—'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Microchip</span>
                  <span className="col-span-2 text-gray-800">{dog.microchip || 'No registrado'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Nacimiento</span>
                  <span className="col-span-2 text-gray-800">{dog.birthDate || '—'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Esterilizado/a</span>
                  <span className="col-span-2 text-gray-800">
                    {dog.isNeutered ? (
                      <>
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Scissors className="w-3 h-3" /> Sí
                        </span>
                        {dog.neuterDate && <span className="text-gray-500 text-xs ml-2">({dog.neuterDate})</span>}
                      </>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Datos del Tutor/a */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Datos del Tutor/a</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Nombre</span>
                  <span className="col-span-2 text-gray-800">{dog.owner.name || '—'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Teléfono</span>
                  <span className="col-span-2 text-gray-800">{dog.owner.phone || '—'}</span>
                </div>
                <div className="grid grid-cols-3 text-sm">
                  <span className="text-gray-500 font-medium">Email</span>
                  <span className="col-span-2 text-gray-800">{dog.owner.email || '—'}</span>
                </div>
              </div>
            </div>

            {/* Salud */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">Información de Salud</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Alergias</h3>
                  {dog.allergies.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-800">
                      {dog.allergies.map((al, idx) => <li key={idx}>{al}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Ninguna registrada</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Enfermedades Diagnosticadas</h3>
                  {dog.diseases.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-800">
                      {dog.diseases.map((enf, idx) => <li key={idx}>{enf}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Ninguna registrada</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cirugías Previas */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Cirugías Previas
              </h2>
              {dog.surgeries.length > 0 ? (
                <div className="space-y-3">
                  {dog.surgeries.map((s, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                        {s.date && <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{s.date}</span>}
                      </div>
                      {s.reason && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Motivo:</span> {s.reason}</p>}
                      {s.notes && <p className="text-sm text-gray-500 mt-1">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Sin cirugías registradas.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
