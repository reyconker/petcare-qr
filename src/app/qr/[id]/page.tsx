import { createClient } from '@/lib/supabase/server';
import { AlertTriangle, Phone, Mail, Syringe, Pill, ShieldOff, UtensilsCrossed } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function PublicQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Use admin / anon client to fetch without RLS restriction on qr_enabled
  const supabase = await createClient();

  // Fetch dog profile by token WITHOUT filtering qr_enabled first
  const { data: dogRow, error } = await supabase
    .from('dog_profiles')
    .select('id, name, breed, weight, photo_url, allergies, diseases, emergency_notes, owner_name, owner_phone, owner_email, qr_enabled, qr_show_allergies, qr_show_conditions, qr_show_treatments, qr_show_vaccines, qr_show_owner_contact, qr_show_emergency_notes, qr_show_food')
    .eq('public_qr_token', id)
    .maybeSingle();

  if (error || !dogRow) notFound();

  // If QR is disabled, show friendly message instead of 404
  if (!dogRow.qr_enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center text-center">
          <div className="bg-gray-100 p-5 rounded-full mb-6">
            <ShieldOff className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Ficha no disponible</h1>
          <p className="text-gray-500 mb-6">
            El tutor/a ha desactivado el acceso público por QR a la ficha de esta mascota.
          </p>
          <p className="text-xs text-gray-300">PetCare QR</p>
        </div>
      </div>
    );
  }

  const dogId = dogRow.id;

  // Fetch public data in parallel (only needed if qr_enabled)
  const [{ data: treatmentsRaw }, { data: vaccinesRaw }, { data: foodRaw }] = await Promise.all([
    supabase.from('treatments').select('id, name, dose_amount, unit, frequency_hours').eq('dog_id', dogId).eq('state', 'activo'),
    supabase.from('vaccines').select('id, name, state').eq('dog_id', dogId),
    supabase.from('food_control').select('brand, food_type, daily_ration_grams, times_per_day').eq('dog_id', dogId).maybeSingle(),
  ]);

  const activeTreatments = treatmentsRaw ?? [];
  const relevantVaccines = (vaccinesRaw ?? []).filter(
    v => v.state === 'al día' || v.state === 'próxima'
  );

  const qr = {
    showAllergies: dogRow.qr_show_allergies ?? true,
    showConditions: dogRow.qr_show_conditions ?? true,
    showActiveTreatments: dogRow.qr_show_treatments ?? true,
    showVaccines: dogRow.qr_show_vaccines ?? true,
    showOwnerContact: dogRow.qr_show_owner_contact ?? true,
    showEmergencyNotes: dogRow.qr_show_emergency_notes ?? true,
    showFood: dogRow.qr_show_food ?? false,
  };

  const allergies: string[] = dogRow.allergies ?? [];
  const diseases: string[] = dogRow.diseases ?? [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-teal-600 h-32 relative"></div>
        <div className="flex flex-col items-center -mt-16 px-6 pb-6 border-b border-gray-100">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md mb-4">
            {dogRow.photo_url ? (
              <img src={dogRow.photo_url} alt={dogRow.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">🐶</div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{dogRow.name}</h1>
          <p className="text-gray-500 font-medium">{dogRow.breed} • {dogRow.weight}kg</p>
        </div>

        <div className="p-6 space-y-6">

          {/* Alertas Médicas */}
          {(qr.showAllergies || qr.showConditions) && (allergies.length > 0 || diseases.length > 0) && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h2 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" /> Atención Médica
              </h2>
              {qr.showAllergies && allergies.length > 0 && (
                <p className="text-red-700 text-sm"><strong>Alergias:</strong> {allergies.join(', ')}</p>
              )}
              {qr.showConditions && diseases.length > 0 && (
                <p className="text-red-700 text-sm mt-1"><strong>Enfermedades:</strong> {diseases.join(', ')}</p>
              )}
            </div>
          )}

          {/* Notas de Emergencia */}
          {qr.showEmergencyNotes && dogRow.emergency_notes && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-sm text-orange-800">
              <strong>Notas de urgencia:</strong> {dogRow.emergency_notes}
            </div>
          )}

          {/* Alimento */}
          {qr.showFood && foodRaw && foodRaw.brand && foodRaw.brand !== 'Sin registrar' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <UtensilsCrossed className="text-amber-600 w-5 h-5" /> Alimentación
              </h2>
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg text-sm space-y-1">
                <p><strong className="text-amber-900">Alimento:</strong> <span className="text-amber-800">{foodRaw.brand}</span></p>
                {foodRaw.food_type && (
                  <p><strong className="text-amber-900">Tipo:</strong> <span className="text-amber-800">{foodRaw.food_type}</span></p>
                )}
                {foodRaw.daily_ration_grams > 0 && (
                  <p><strong className="text-amber-900">Ración diaria:</strong> <span className="text-amber-800">{foodRaw.daily_ration_grams}g</span></p>
                )}
                {foodRaw.times_per_day > 0 && (
                  <p><strong className="text-amber-900">Comidas por día:</strong> <span className="text-amber-800">{foodRaw.times_per_day}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Tratamientos Activos */}
          {qr.showActiveTreatments && activeTreatments.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Pill className="text-teal-600 w-5 h-5" /> Tratamientos Activos
              </h2>
              <div className="space-y-2">
                {activeTreatments.map(t => (
                  <div key={t.id} className="bg-teal-50 border border-teal-100 p-3 rounded-lg text-sm">
                    <p className="font-bold text-teal-900">{t.name}</p>
                    <p className="text-teal-600 text-xs mt-1">
                      Dosis: {t.dose_amount} {t.unit} cada {t.frequency_hours} horas
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vacunas */}
          {qr.showVaccines && relevantVaccines.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Syringe className="text-blue-600 w-5 h-5" /> Vacunas Principales
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {relevantVaccines.map(v => (
                  <div key={v.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                    <span className="font-medium text-gray-700">{v.name}</span>
                    <span className={v.state === 'al día' ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>
                      {v.state.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contacto Tutor/a */}
          {qr.showOwnerContact && (dogRow.owner_name || dogRow.owner_phone || dogRow.owner_email) && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Contacto de Emergencia</h2>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                {dogRow.owner_name && <p className="font-bold text-gray-800 text-lg mb-3">{dogRow.owner_name}</p>}
                <div className="space-y-2">
                  {dogRow.owner_phone && (
                    <a href={`tel:${dogRow.owner_phone}`} className="flex items-center gap-3 text-teal-600 hover:text-teal-700 font-medium">
                      <div className="bg-teal-100 p-2 rounded-full"><Phone className="w-4 h-4" /></div>
                      {dogRow.owner_phone}
                    </a>
                  )}
                  {dogRow.owner_email && (
                    <a href={`mailto:${dogRow.owner_email}`} className="flex items-center gap-3 text-teal-600 hover:text-teal-700 font-medium">
                      <div className="bg-teal-100 p-2 rounded-full"><Mail className="w-4 h-4" /></div>
                      {dogRow.owner_email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 text-center text-xs text-gray-400">
          Generado por <strong>PetCare QR</strong>
        </div>
      </div>
    </div>
  );
}
