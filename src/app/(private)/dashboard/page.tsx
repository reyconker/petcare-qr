import { getDbData } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import {
  Pill, Bone, Syringe, AlertCircle, Stethoscope,
  FlaskConical, MapPin, QrCode, CalendarClock, ChevronRight
} from 'lucide-react';
import { OnboardingChecklist } from './OnboardingChecklist';
import Link from 'next/link';

async function getVisitsCount() {
  try {
    const supabase = await createClient();
    const dogId = await getDogId();
    const { count } = await supabase.from('veterinary_visits').select('id', { count: 'exact', head: true }).eq('dog_id', dogId);
    return count ?? 0;
  } catch { return 0; }
}

async function getExamsCount() {
  try {
    const supabase = await createClient();
    const dogId = await getDogId();
    const { count } = await supabase.from('exams').select('id', { count: 'exact', head: true }).eq('dog_id', dogId);
    return count ?? 0;
  } catch { return 0; }
}

export default async function DashboardPage() {
  const [data, visitsCount, examsCount] = await Promise.all([
    getDbData(),
    getVisitsCount(),
    getExamsCount(),
  ]);

  const activeTreatments = data.treatments.filter((t) => t.state === 'activo');
  const nextVaccine = data.vaccines.find((v) => v.state === 'próxima');
  const overdueVaccines = data.vaccines.filter((v) => v.state === 'vencida');
  const foodRemainingDays = data.food.dailyRationGrams > 0
    ? Math.floor((data.food.remainingQuantityKg * 1000) / data.food.dailyRationGrams)
    : 0;
  const hasFood = data.food.brand !== 'Sin registrar' || data.food.foodName !== '';
  const isFoodLow = hasFood && foodRemainingDays <= data.food.alertThresholdDays;

  const quickLinks = [
    { href: '/hoy', icon: CalendarClock, label: 'Hoy', color: 'bg-teal-100 text-teal-700' },
    { href: '/tratamientos', icon: Pill, label: 'Tratamientos', color: 'bg-purple-100 text-purple-700' },
    { href: '/ficha', icon: Stethoscope, label: 'Ficha médica', color: 'bg-indigo-100 text-indigo-700' },
    { href: '/examenes', icon: FlaskConical, label: 'Exámenes', color: 'bg-teal-100 text-teal-700' },
    { href: '/centros-veterinarios', icon: MapPin, label: 'Centros Vet.', color: 'bg-green-100 text-green-700' },
    { href: '/qr-config', icon: QrCode, label: 'Código QR', color: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hola{data.dog.owner.name ? `, ${data.dog.owner.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen de <strong>{data.dog.name}</strong></p>
      </div>

      <OnboardingChecklist
        hasFood={hasFood}
        hasVaccines={data.vaccines.length > 0}
        hasTreatments={data.treatments.length > 0}
        qrEnabled={data.qrSettings.enabled}
      />

      {/* Alerts */}
      {(isFoodLow || overdueVaccines.length > 0) && (
        <div className="space-y-2">
          {overdueVaccines.map((v) => (
            <Link
              key={v.id}
              href="/vacunas"
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 hover:opacity-80 transition-opacity"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">
                {v.type === 'vacuna' ? 'Vacuna' : 'Desparasitación'} &quot;{v.name}&quot; está vencida.
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />
            </Link>
          ))}
          {isFoodLow && (
            <Link
              href="/alimento"
              className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-orange-700 hover:opacity-80 transition-opacity"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">
                ¡Queda alimento para ~{foodRemainingDays} días! Recuerda comprar pronto.
              </span>
              <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-60" />
            </Link>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/tratamientos" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="bg-teal-100 p-2.5 rounded-xl w-fit mb-3">
            <Pill className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{activeTreatments.length}</p>
          <p className="text-gray-500 text-xs mt-0.5">Tratamientos activos</p>
        </Link>

        <Link href="/alimento" className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow ${isFoodLow ? 'border-orange-200' : 'border-gray-100'}`}>
          <div className={`p-2.5 rounded-xl w-fit mb-3 ${isFoodLow ? 'bg-orange-100' : 'bg-amber-100'}`}>
            <Bone className={`w-5 h-5 ${isFoodLow ? 'text-orange-600' : 'text-amber-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${isFoodLow ? 'text-orange-600' : 'text-gray-800'}`}>
            {hasFood ? `~${foodRemainingDays}d` : '—'}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">Días de alimento</p>
        </Link>

        <Link href="/vacunas" className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow ${overdueVaccines.length > 0 ? 'border-red-200' : 'border-gray-100'}`}>
          <div className={`p-2.5 rounded-xl w-fit mb-3 ${overdueVaccines.length > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Syringe className={`w-5 h-5 ${overdueVaccines.length > 0 ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          {nextVaccine ? (
            <>
              <p className="text-lg font-bold text-gray-800 truncate">{nextVaccine.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{nextVaccine.nextDate}</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-green-600">{data.vaccines.length > 0 ? '✓' : '—'}</p>
              <p className="text-gray-500 text-xs mt-0.5">{data.vaccines.length > 0 ? 'Vacunas al día' : 'Sin vacunas'}</p>
            </>
          )}
        </Link>

        <Link href="/ficha" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
          <div className="bg-indigo-100 p-2.5 rounded-xl w-fit mb-3">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{visitsCount}</p>
          <p className="text-gray-500 text-xs mt-0.5">Atenciones registradas</p>
        </Link>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Acceso rápido</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className={`p-2.5 rounded-xl ${link.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Secondary info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-500" /> Exámenes
          </h3>
          <p className="text-3xl font-bold text-gray-800">{examsCount}</p>
          <p className="text-gray-400 text-xs mt-0.5">registrado{examsCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-blue-500" /> Vacunas / Desparasitación
          </h3>
          <p className="text-3xl font-bold text-gray-800">{data.vaccines.length}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {overdueVaccines.length > 0 ? `${overdueVaccines.length} vencida${overdueVaccines.length !== 1 ? 's' : ''}` : 'Sin vencidas'}
          </p>
        </div>
      </div>
    </div>
  );
}
