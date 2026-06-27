import { getDbData } from '@/lib/db';
import { Syringe, Shield, ShieldAlert, ShieldCheck, Trash2, Calendar, User } from 'lucide-react';
import { deleteVaccine } from '@/app/actions/vaccines';
import { AddVaccineButton, EditVaccineButton } from './VaccineForms';
import { Vaccine } from '@/types';

const STATE_CONFIG: Record<string, { icon: typeof Shield; color: string; text: string }> = {
  'al día': { icon: ShieldCheck, color: 'text-green-700 bg-green-100 border-green-200', text: 'Al día' },
  'próxima': { icon: ShieldAlert, color: 'text-amber-700 bg-amber-100 border-amber-200', text: 'Próxima' },
  'vencida': { icon: ShieldAlert, color: 'text-red-700 bg-red-100 border-red-200', text: 'Vencida' },
};

function VaccineCard({ vaccine }: { vaccine: Vaccine }) {
  const cfg = STATE_CONFIG[vaccine.state] ?? { icon: Shield, color: 'text-gray-600 bg-gray-100 border-gray-200', text: vaccine.state };
  const StateIcon = cfg.icon;

  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${vaccine.state === 'vencida' ? 'border-red-200' : vaccine.state === 'próxima' ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-800 truncate">{vaccine.name}</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{vaccine.type}</span>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cfg.color}`}>
            <StateIcon className="w-3 h-3" />
            {cfg.text}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <EditVaccineButton vaccine={vaccine} />
          <form action={async () => {
            'use server';
            await deleteVaccine(vaccine.id);
          }}>
            <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 text-xs mb-0.5">Aplicación</p>
          <p className="font-medium text-gray-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" /> {vaccine.applicationDate || '—'}
          </p>
        </div>
        <div className={`rounded-lg p-2.5 ${vaccine.state === 'vencida' ? 'bg-red-50' : vaccine.state === 'próxima' ? 'bg-amber-50' : 'bg-gray-50'}`}>
          <p className="text-gray-400 text-xs mb-0.5">Próxima dosis</p>
          <p className={`font-medium flex items-center gap-1 ${vaccine.state === 'vencida' ? 'text-red-700' : vaccine.state === 'próxima' ? 'text-amber-700' : 'text-gray-700'}`}>
            <Calendar className="w-3 h-3" /> {vaccine.nextDate || '—'}
          </p>
        </div>
      </div>

      {vaccine.veterinarian && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <User className="w-3 h-3" /> {vaccine.veterinarian}
        </div>
      )}

      {vaccine.notes && (
        <p className="mt-2 text-xs text-gray-400 border-t pt-2">{vaccine.notes}</p>
      )}
    </div>
  );
}

export default async function VacunasPage() {
  const data = await getDbData();
  const vaccines = data.vaccines;

  const overdueVaccines = vaccines.filter((v) => v.state === 'vencida');
  const upcomingVaccines = vaccines.filter((v) => v.state === 'próxima');
  const upToDateVaccines = vaccines.filter((v) => v.state === 'al día');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-blue-600" /> Vacunas y Desparasitaciones
          </h1>
          <p className="text-gray-500 text-sm mt-1">Esquema preventivo de {data.dog.name}</p>
        </div>
        <AddVaccineButton />
      </div>

      {/* Summary chips */}
      {vaccines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {overdueVaccines.length > 0 && (
            <span className="flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-full text-sm font-semibold">
              <ShieldAlert className="w-4 h-4" /> {overdueVaccines.length} vencida{overdueVaccines.length !== 1 ? 's' : ''}
            </span>
          )}
          {upcomingVaccines.length > 0 && (
            <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-sm font-semibold">
              <ShieldAlert className="w-4 h-4" /> {upcomingVaccines.length} próxima{upcomingVaccines.length !== 1 ? 's' : ''}
            </span>
          )}
          {upToDateVaccines.length > 0 && (
            <span className="flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-semibold">
              <ShieldCheck className="w-4 h-4" /> {upToDateVaccines.length} al día
            </span>
          )}
        </div>
      )}

      {vaccines.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-blue-200 rounded-xl p-12 text-center">
          <div className="bg-blue-50 p-5 rounded-full mb-4">
            <Shield className="w-12 h-12 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin registros preventivos</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Lleva el control de todas las vacunas y desparasitaciones para mantener a {data.dog.name} protegido/a.
          </p>
          <AddVaccineButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaccines.map((vaccine) => (
            <VaccineCard key={vaccine.id} vaccine={vaccine} />
          ))}
        </div>
      )}
    </div>
  );
}
