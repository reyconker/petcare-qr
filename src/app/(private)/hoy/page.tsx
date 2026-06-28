import { getDbData } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { markDoseAsGiven } from '@/app/actions/treatments';
import {
  CheckCircle, Clock, AlertTriangle, Pill, Bone,
  Syringe, Calendar, ChevronRight, Info, Stethoscope,
  QrCode, Plus,
} from 'lucide-react';
import Link from 'next/link';

async function getNextControl() {
  try {
    const supabase = await createClient();
    const dogId = await getDogId();
    const { data } = await supabase
      .from('veterinary_visits')
      .select('next_control, clinic, vet_name')
      .eq('dog_id', dogId)
      .not('next_control', 'is', null)
      .order('next_control', { ascending: true })
      .limit(1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export default async function HoyPage() {
  const [data, nextControl] = await Promise.all([getDbData(), getNextControl()]);
  const today = new Date().toISOString().split('T')[0];

  const activeTreatments = data.treatments.filter((t) => t.state === 'activo');
  const totalGrams = data.food.remainingQuantityKg * 1000;
  const foodDaysLeft = data.food.dailyRationGrams > 0
    ? Math.floor(totalGrams / data.food.dailyRationGrams)
    : 0;
  const isFoodLow = data.food.brand !== 'Sin registrar' && foodDaysLeft <= data.food.alertThresholdDays;
  const hasFood = data.food.brand !== 'Sin registrar' || data.food.foodName !== '';

  const urgentVaccines = data.vaccines.filter((v) => v.state === 'vencida');
  const upcomingVaccines = data.vaccines.filter((v) => v.state === 'próxima');

  // Panel de primeros pasos solo si no hay datos aún
  const hasAnyData = activeTreatments.length > 0 || hasFood || data.vaccines.length > 0 || nextControl;

  const alerts = [
    ...urgentVaccines.map((v) => ({
      id: v.id,
      level: 'error' as const,
      text: `${v.type === 'vacuna' ? 'Vacuna' : 'Desparasitación'} "${v.name}" está vencida.`,
      href: '/vacunas',
    })),
    ...(isFoodLow
      ? [{ id: 'food', level: 'warning' as const, text: `Alimento bajo — quedan ~${foodDaysLeft} día${foodDaysLeft !== 1 ? 's' : ''}.`, href: '/alimento' }]
      : []),
    ...upcomingVaccines.map((v) => ({
      id: v.id,
      level: 'warning' as const,
      text: `${v.type === 'vacuna' ? 'Vacuna' : 'Desparasitación'} "${v.name}" vence el ${v.nextDate}.`,
      href: '/vacunas',
    })),
    ...(nextControl
      ? [{ id: 'control', level: 'info' as const, text: `Próximo control veterinario: ${nextControl.next_control}${nextControl.clinic ? ` — ${nextControl.clinic}` : ''}.`, href: '/ficha' }]
      : []),
    ...(data.dog.emergencyNotes
      ? [{ id: 'emergency', level: 'info' as const, text: `Nota de emergencia: ${data.dog.emergencyNotes.slice(0, 80)}${data.dog.emergencyNotes.length > 80 ? '…' : ''}`, href: '/perfil' }]
      : []),
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {greeting}{data.dog.owner.name ? `, ${data.dog.owner.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Control diario de <strong>{data.dog.name}</strong> —{' '}
          {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Panel primeros pasos — solo si no hay datos aún */}
      {!hasAnyData && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
          <h2 className="font-bold text-teal-800 mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Empieza a registrar a {data.dog.name}
          </h2>
          <p className="text-teal-700 text-sm mb-4">
            Agrega información para aprovechar PetCare QR al máximo.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { href: '/tratamientos', icon: Pill, label: 'Agregar tratamiento' },
              { href: '/alimento', icon: Bone, label: 'Registrar alimento' },
              { href: '/vacunas', icon: Syringe, label: 'Agregar vacuna' },
              { href: '/qr-config', icon: QrCode, label: 'Configurar QR' },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1.5 bg-white border border-teal-200 rounded-lg p-3 text-center text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Icon className="w-5 h-5 text-teal-600" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => {
            const bgColor =
              alert.level === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : alert.level === 'warning'
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-blue-50 border-blue-200 text-blue-700';
            const Icon = alert.level === 'error' || alert.level === 'warning' ? AlertTriangle : Info;
            return (
              <Link
                key={alert.id}
                href={alert.href}
                className={`flex items-start gap-3 border rounded-xl p-3.5 transition-opacity hover:opacity-80 ${bgColor}`}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">{alert.text}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-60" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Sin alertas y con datos */}
      {alerts.length === 0 && hasAnyData && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">Todo en orden por hoy 🎉</p>
        </div>
      )}

      {/* Medicamentos del día */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-teal-600" /> Medicamentos de hoy
          </h2>
          <Link href="/tratamientos" className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {activeTreatments.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <Pill className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm mb-2">
              {data.dog.name} no tiene medicamentos activos hoy.
            </p>
            <Link href="/tratamientos" className="text-teal-600 text-sm font-medium hover:underline inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Agregar tratamiento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTreatments.map((treatment) => {
              const dosesPerDay = treatment.frequencyHours > 0 ? 24 / treatment.frequencyHours : 1;
              const dosesGivenToday = data.doseHistory.filter(
                (d) => d.treatmentId === treatment.id && d.givenAt.startsWith(today)
              ).length;
              const dosesLeft = Math.ceil(dosesPerDay) - dosesGivenToday;
              const isPending = dosesGivenToday < Math.ceil(dosesPerDay);
              const outOfStock = treatment.remainingQuantity < treatment.doseAmount;
              const timesLabel =
                Math.ceil(dosesPerDay) === 1
                  ? '1 vez al día'
                  : `${Math.ceil(dosesPerDay)} veces al día`;

              return (
                <div
                  key={treatment.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm transition-shadow hover:shadow-md ${
                    isPending && !outOfStock ? 'border-teal-200' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{treatment.name}</h3>
                      <p className="text-teal-600 text-sm">
                        {treatment.doseAmount} {treatment.unit}
                      </p>
                    </div>
                    {outOfStock ? (
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                        SIN STOCK
                      </span>
                    ) : isPending ? (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" /> {dosesLeft} PENDIENTE{dosesLeft !== 1 ? 'S' : ''}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                        <CheckCircle className="w-3 h-3" /> COMPLETADO
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-xs mb-3">
                    {timesLabel} · {dosesGivenToday} de {Math.ceil(dosesPerDay)} dosis dadas hoy
                  </p>

                  {isPending && !outOfStock ? (
                    <form
                      action={async () => {
                        'use server';
                        await markDoseAsGiven(
                          treatment.id,
                          treatment.name,
                          treatment.doseAmount,
                          treatment.unit
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" /> Marcar dosis como dada
                      </button>
                    </form>
                  ) : (
                    <div
                      className={`w-full text-center py-2.5 rounded-lg text-sm font-medium ${
                        outOfStock ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      {outOfStock
                        ? '⚠ Sin stock — contacta a tu veterinario/a'
                        : '✓ Todas las dosis del día completadas'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Resumen: alimento + vacunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Alimento */}
        <Link
          href="/alimento"
          className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 ${
            isFoodLow ? 'border-orange-200' : 'border-gray-100'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              isFoodLow ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Bone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 text-sm">Alimento</p>
            {hasFood ? (
              <>
                <p className={`font-bold text-lg ${isFoodLow ? 'text-orange-600' : 'text-gray-800'}`}>
                  ~{foodDaysLeft} días
                </p>
                <p className="text-xs text-gray-400">
                  Ración: {data.food.dailyRationGrams}g/día · {data.food.timesPerDay} comida
                  {data.food.timesPerDay !== 1 ? 's' : ''}
                </p>
              </>
            ) : (
              <p className="text-xs text-teal-600 mt-0.5">Toca para registrar alimento →</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
        </Link>

        {/* Vacunas */}
        <Link
          href="/vacunas"
          className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 ${
            urgentVaccines.length > 0
              ? 'border-red-200'
              : upcomingVaccines.length > 0
              ? 'border-amber-200'
              : 'border-gray-100'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl flex-shrink-0 ${
              urgentVaccines.length > 0
                ? 'bg-red-100 text-red-600'
                : upcomingVaccines.length > 0
                ? 'bg-amber-100 text-amber-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            <Syringe className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-800 text-sm">Vacunas y desparasitaciones</p>
            {data.vaccines.length === 0 ? (
              <p className="text-xs text-teal-600 mt-0.5">Toca para registrar →</p>
            ) : urgentVaccines.length > 0 ? (
              <p className="text-red-600 font-bold text-sm">
                {urgentVaccines.length} vencida{urgentVaccines.length !== 1 ? 's' : ''}
              </p>
            ) : upcomingVaccines.length > 0 ? (
              <p className="text-amber-600 font-bold text-sm">
                {upcomingVaccines.length} próxima{upcomingVaccines.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-green-600 font-bold text-sm">Al día ✓</p>
            )}
            {data.vaccines.length > 0 && (
              <p className="text-xs text-gray-400">
                {data.vaccines.length} registrada{data.vaccines.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
        </Link>
      </div>

      {/* Próximo control veterinario */}
      {nextControl ? (
        <Link
          href="/ficha"
          className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4 hover:opacity-80 transition-opacity"
        >
          <div className="bg-indigo-100 p-2.5 rounded-xl flex-shrink-0">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-indigo-800 text-sm">Próximo control veterinario</p>
            <p className="text-indigo-700 text-xs">
              {nextControl.next_control}
              {nextControl.vet_name ? ` — Dr/a. ${nextControl.vet_name}` : ''}
              {nextControl.clinic ? ` · ${nextControl.clinic}` : ''}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
        </Link>
      ) : (
        <Link
          href="/ficha"
          className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="bg-gray-100 p-2.5 rounded-xl flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-600 text-sm">Sin controles veterinarios programados</p>
            <p className="text-teal-600 text-xs">Registrar atención veterinaria →</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Link>
      )}
    </div>
  );
}
