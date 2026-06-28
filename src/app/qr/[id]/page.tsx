import { createClient } from '@/lib/supabase/server';
import {
  AlertTriangle, Phone, Mail, Syringe, Pill,
  ShieldOff, UtensilsCrossed, HeartPulse, Clock,
} from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function PublicQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: dogRow, error } = await supabase
    .from('dog_profiles')
    .select(
      'id, name, breed, species, weight, photo_url, allergies, diseases, emergency_notes, ' +
      'owner_name, owner_phone, owner_email, ' +
      'qr_enabled, qr_show_allergies, qr_show_conditions, qr_show_treatments, ' +
      'qr_show_vaccines, qr_show_owner_contact, qr_show_emergency_notes, qr_show_food'
    )
    .eq('public_qr_token', id)
    .maybeSingle();

  if (error || !dogRow) notFound();

  // Cast to known shape via unknown (project uses manual types, not generated Supabase types)
  const dog = dogRow as unknown as {
    id: string;
    name: string;
    breed?: string;
    species?: string;
    weight?: number;
    photo_url?: string;
    allergies?: string[];
    diseases?: string[];
    emergency_notes?: string;
    owner_name?: string;
    owner_phone?: string;
    owner_email?: string;
    qr_enabled: boolean;
    qr_show_allergies?: boolean;
    qr_show_conditions?: boolean;
    qr_show_treatments?: boolean;
    qr_show_vaccines?: boolean;
    qr_show_owner_contact?: boolean;
    qr_show_emergency_notes?: boolean;
    qr_show_food?: boolean;
  };

  // QR desactivado por el tutor/a
  if (!dog.qr_enabled) {
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

  const dogId = dog.id;

  const [{ data: treatmentsRaw }, { data: vaccinesRaw }, { data: foodRaw }] = await Promise.all([
    supabase
      .from('treatments')
      .select('id, name, dose_amount, unit, frequency_hours, end_date, is_permanent')
      .eq('dog_id', dogId)
      .eq('state', 'activo'),
    supabase.from('vaccines').select('id, name, state, next_date').eq('dog_id', dogId),
    supabase
      .from('food_control')
      .select('brand, food_name, food_type, daily_ration_grams, times_per_day')
      .eq('dog_id', dogId)
      .maybeSingle(),
  ]);

  const activeTreatments = treatmentsRaw ?? [];
  const allVaccines = vaccinesRaw ?? [];
  // Para el veterinario, mostrar todas (incluyendo vencidas)
  const relevantVaccines = allVaccines.filter(
    (v) => v.state === 'al día' || v.state === 'próxima' || v.state === 'vencida'
  );

  const qr = {
    showAllergies: dog.qr_show_allergies ?? true,
    showConditions: dog.qr_show_conditions ?? true,
    showActiveTreatments: dog.qr_show_treatments ?? true,
    showVaccines: dog.qr_show_vaccines ?? true,
    showOwnerContact: dog.qr_show_owner_contact ?? true,
    showEmergencyNotes: dog.qr_show_emergency_notes ?? true,
    showFood: dog.qr_show_food ?? false,
  };

  const allergies: string[] = dog.allergies ?? [];
  const diseases: string[] = dog.diseases ?? [];

  const hasAlerts =
    (qr.showAllergies && allergies.length > 0) ||
    (qr.showConditions && diseases.length > 0) ||
    (qr.showEmergencyNotes && dog.emergency_notes);

  const vaccineStateLabel: Record<string, string> = {
    'al día': 'Al día ✓',
    'próxima': 'Próxima',
    'vencida': 'Vencida ⚠',
  };

  const vaccineStateColor: Record<string, string> = {
    'al día': 'text-green-600 font-bold',
    'próxima': 'text-amber-600 font-bold',
    'vencida': 'text-red-600 font-bold',
  };

  const foodLabel = foodRaw?.food_name || foodRaw?.brand || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header visual */}
        <div className="bg-teal-600 h-28 relative" />
        <div className="flex flex-col items-center -mt-14 px-6 pb-5 border-b border-gray-100">
          <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-md mb-3">
            {dog.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                {dog.species === 'gato' ? '🐱' : '🐶'}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{dog.name}</h1>
          <p className="text-gray-500 text-sm font-medium mt-0.5">
            {dog.breed && `${dog.breed}`}
            {dog.weight && dog.breed && ' · '}
            {dog.weight && `${dog.weight} kg`}
          </p>
        </div>

        <div className="p-5 space-y-5">

          {/* ALERTAS MÉDICAS — lo más importante para el veterinario */}
          {hasAlerts && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h2 className="text-red-800 font-bold flex items-center gap-2 mb-3 text-base">
                <AlertTriangle className="w-5 h-5" /> Información importante
              </h2>
              {qr.showAllergies && allergies.length > 0 && (
                <div className="mb-2">
                  <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-1">Alergias</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((a, i) => (
                      <span key={i} className="bg-red-100 text-red-800 text-sm px-2 py-0.5 rounded-full font-medium">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {qr.showConditions && diseases.length > 0 && (
                <div className="mb-2">
                  <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-1">Enfermedades crónicas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {diseases.map((d, i) => (
                      <span key={i} className="bg-orange-100 text-orange-800 text-sm px-2 py-0.5 rounded-full font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {qr.showEmergencyNotes && dog.emergency_notes && (
                <div>
                  <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-1">Notas de urgencia</p>
                  <p className="text-red-800 text-sm bg-red-100 p-2 rounded-lg">{dog.emergency_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Tratamientos activos */}
          {qr.showActiveTreatments && activeTreatments.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Pill className="text-teal-600 w-5 h-5" /> Medicamentos activos
              </h2>
              <div className="space-y-2">
                {activeTreatments.map((t) => {
                  const timesPerDay = t.frequency_hours > 0 ? Math.ceil(24 / t.frequency_hours) : 1;
                  const timesLabel = timesPerDay === 1 ? '1 vez al día' : `${timesPerDay} veces al día`;
                  return (
                    <div key={t.id} className="bg-teal-50 border border-teal-100 p-3 rounded-xl">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-teal-900 text-sm">{t.name}</p>
                        {t.is_permanent && (
                          <span className="text-xs bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            Permanente
                          </span>
                        )}
                        {!t.is_permanent && t.end_date && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> hasta {t.end_date}
                          </span>
                        )}
                      </div>
                      <p className="text-teal-700 text-xs mt-1">
                        {t.dose_amount} {t.unit} · {timesLabel}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vacunas */}
          {qr.showVaccines && relevantVaccines.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Syringe className="text-blue-600 w-5 h-5" /> Vacunas y desparasitaciones
              </h2>
              <div className="divide-y divide-gray-100 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                {relevantVaccines.map((v) => (
                  <div key={v.id} className="flex justify-between items-center px-3 py-2.5 text-sm">
                    <span className="font-medium text-gray-700">{v.name}</span>
                    <div className="text-right">
                      <span className={vaccineStateColor[v.state] ?? 'text-gray-500'}>
                        {vaccineStateLabel[v.state] ?? v.state}
                      </span>
                      {v.next_date && (
                        <p className="text-gray-400 text-xs">{v.next_date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alimentación */}
          {qr.showFood && foodLabel && (
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-2">
                <UtensilsCrossed className="text-amber-600 w-5 h-5" /> Alimentación
              </h2>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-sm space-y-1">
                <p>
                  <span className="font-semibold text-amber-900">Alimento: </span>
                  <span className="text-amber-800">{foodLabel}</span>
                </p>
                {foodRaw?.food_type && (
                  <p>
                    <span className="font-semibold text-amber-900">Tipo: </span>
                    <span className="text-amber-800">{foodRaw.food_type}</span>
                  </p>
                )}
                {foodRaw && foodRaw.daily_ration_grams > 0 && (
                  <p>
                    <span className="font-semibold text-amber-900">Ración diaria: </span>
                    <span className="text-amber-800">{foodRaw.daily_ration_grams} g</span>
                  </p>
                )}
                {foodRaw && foodRaw.times_per_day > 0 && (
                  <p>
                    <span className="font-semibold text-amber-900">Comidas por día: </span>
                    <span className="text-amber-800">{foodRaw.times_per_day}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Si no hay nada habilitado */}
          {!hasAlerts && activeTreatments.length === 0 && relevantVaccines.length === 0 && !qr.showFood && (
            <div className="text-center py-6 text-gray-400">
              <HeartPulse className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">El tutor/a no ha habilitado información pública adicional.</p>
            </div>
          )}

          {/* Contacto del tutor/a */}
          {qr.showOwnerContact && (dog.owner_name || dog.owner_phone || dog.owner_email) && (
            <div className="border-t pt-5 mt-5">
              <h2 className="text-base font-bold text-gray-800 mb-3">Contacto del tutor/a</h2>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                {dog.owner_name && (
                  <p className="font-bold text-gray-800 text-base">{dog.owner_name}</p>
                )}
                {dog.owner_phone && (
                  <a
                    href={`tel:${dog.owner_phone}`}
                    className="flex items-center gap-3 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>{dog.owner_phone}</span>
                  </a>
                )}
                {dog.owner_email && (
                  <a
                    href={`mailto:${dog.owner_email}`}
                    className="flex items-center gap-3 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="truncate">{dog.owner_email}</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center text-xs text-gray-400">
          Ficha generada con <strong>PetCare QR</strong> — para uso informativo
        </div>
      </div>
    </div>
  );
}
