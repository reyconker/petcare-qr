import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { Activity, Stethoscope, Calendar, Phone, Trash2, Clock, ChevronRight } from 'lucide-react';
import { deleteVisit } from '@/app/actions/veterinary-visits';
import { AddVisitButton, EditVisitButton } from './VisitForms';
import { VeterinaryVisit, VisitType } from '@/types';

const VISIT_TYPE_COLORS: Record<VisitType | string, string> = {
  'medicina general': 'bg-blue-100 text-blue-800',
  'especialidad': 'bg-purple-100 text-purple-800',
  'urgencia': 'bg-red-100 text-red-800',
  'control sano': 'bg-green-100 text-green-800',
  'vacunación': 'bg-teal-100 text-teal-800',
  'cirugía': 'bg-orange-100 text-orange-800',
  'otro': 'bg-gray-100 text-gray-700',
};

const VISIT_TYPE_LABELS: Record<VisitType | string, string> = {
  'medicina general': 'Medicina General',
  'especialidad': 'Especialidad',
  'urgencia': 'Urgencia',
  'control sano': 'Control Sano',
  'vacunación': 'Vacunación',
  'cirugía': 'Cirugía',
  'otro': 'Otro',
};

async function getVisits(): Promise<VeterinaryVisit[]> {
  const supabase = await createClient();
  const dogId = await getDogId();

  const { data } = await supabase
    .from('veterinary_visits')
    .select('*')
    .eq('dog_id', dogId)
    .order('date', { ascending: false });

  return (data ?? []).map((v) => ({
    id: v.id,
    dogId: v.dog_id,
    date: v.date ?? '',
    clinic: v.clinic ?? '',
    clinicPhone: v.clinic_phone ?? '',
    visitType: v.visit_type as VisitType,
    specialtyName: v.specialty_name ?? '',
    vetName: v.vet_name ?? '',
    tasks: v.tasks ?? '',
    observations: v.observations ?? '',
    nextControl: v.next_control ?? '',
    treatmentIds: v.treatment_ids ?? [],
    createdAt: v.created_at ?? '',
  }));
}

export default async function FichaMedicaPage() {
  const visits = await getVisits();

  // Próximo control más cercano
  const upcoming = visits
    .filter((v) => v.nextControl)
    .sort((a, b) => a.nextControl.localeCompare(b.nextControl))[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-indigo-600" /> Ficha Médica
          </h1>
          <p className="text-gray-500 text-sm mt-1">Atenciones veterinarias y consultas</p>
        </div>
        <AddVisitButton />
      </div>

      {/* Alerta próximo control */}
      {upcoming && (
        <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="bg-indigo-100 p-2 rounded-full flex-shrink-0">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-800">Próximo control agendado</p>
            <p className="text-sm text-indigo-700">
              {upcoming.nextControl}
              {upcoming.clinic && ` — ${upcoming.clinic}`}
              {upcoming.vetName && ` (${upcoming.vetName})`}
            </p>
          </div>
        </div>
      )}

      {/* Lista de atenciones */}
      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-indigo-200 rounded-xl p-12 text-center">
          <div className="bg-indigo-50 p-5 rounded-full mb-4">
            <Stethoscope className="w-12 h-12 text-indigo-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin atenciones registradas</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Registra las visitas al veterinario para llevar un historial médico completo de tu mascota.
          </p>
          <AddVisitButton />
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => {
            const typeColor = VISIT_TYPE_COLORS[visit.visitType] ?? VISIT_TYPE_COLORS['otro'];
            const typeLabel = VISIT_TYPE_LABELS[visit.visitType] ?? visit.visitType;

            return (
              <div
                key={visit.id}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
                        {typeLabel}
                        {visit.specialtyName && ` — ${visit.specialtyName}`}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {visit.date}
                      </span>
                    </div>
                    {visit.clinic && (
                      <p className="text-sm font-semibold text-gray-800">{visit.clinic}</p>
                    )}
                    {visit.vetName && (
                      <p className="text-sm text-gray-500">{visit.vetName}</p>
                    )}
                    {visit.clinicPhone && (
                      <a
                        href={`tel:${visit.clinicPhone}`}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-medium mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" /> {visit.clinicPhone}
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <EditVisitButton visit={visit} />
                    <form
                      action={async () => {
                        'use server';
                        await deleteVisit(visit.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {visit.tasks && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Indicaciones
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{visit.tasks}</p>
                  </div>
                )}

                {visit.observations && (
                  <div className="mt-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Observaciones
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{visit.observations}</p>
                  </div>
                )}

                {visit.nextControl && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-indigo-700">
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    <span>
                      <strong>Próximo control:</strong> {visit.nextControl}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
