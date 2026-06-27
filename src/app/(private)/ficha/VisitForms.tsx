'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addVisit, editVisit } from '@/app/actions/veterinary-visits';
import { VeterinaryVisit, VisitType } from '@/types';
import { Pencil, Plus, AlertCircle, Phone } from 'lucide-react';

const VISIT_TYPES: VisitType[] = [
  'medicina general',
  'especialidad',
  'urgencia',
  'control sano',
  'vacunación',
  'cirugía',
  'otro',
];

const VISIT_TYPE_LABELS: Record<VisitType, string> = {
  'medicina general': 'Medicina General',
  'especialidad': 'Especialidad',
  'urgencia': 'Urgencia',
  'control sano': 'Control Sano',
  'vacunación': 'Vacunación',
  'cirugía': 'Cirugía',
  'otro': 'Otro',
};

// ── Campos del formulario ─────────────────────────────────────────────────────
function VisitFormFields({ visit }: { visit?: VeterinaryVisit }) {
  const [visitType, setVisitType] = useState<VisitType>(visit?.visitType ?? 'medicina general');

  return (
    <>
      <input type="hidden" name="visitType" value={visitType} />

      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="date"
          defaultValue={visit?.date}
          required
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Tipo de consulta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de consulta <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {VISIT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setVisitType(t)}
              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors text-center ${
                visitType === t
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {VISIT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Especialidad (sólo si tipo = especialidad) */}
      {visitType === 'especialidad' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre de la especialidad</label>
          <input
            type="text"
            name="specialtyName"
            defaultValue={visit?.specialtyName}
            placeholder="Ej: Cardiología, Dermatología"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      )}
      {visitType !== 'especialidad' && (
        <input type="hidden" name="specialtyName" value="" />
      )}

      {/* Clínica y teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Clínica</label>
          <input
            type="text"
            name="clinic"
            defaultValue={visit?.clinic}
            placeholder="Ej: Clínica Veterinaria Sur"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" /> Teléfono clínica
          </label>
          <input
            type="tel"
            name="clinicPhone"
            defaultValue={visit?.clinicPhone}
            placeholder="Ej: +56 2 1234 5678"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Veterinario/a */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Veterinario/a a cargo</label>
        <input
          type="text"
          name="vetName"
          defaultValue={visit?.vetName}
          placeholder="Ej: Dra. López"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Tareas / Indicaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tareas e indicaciones del veterinario</label>
        <textarea
          name="tasks"
          defaultValue={visit?.tasks}
          rows={3}
          placeholder="Ej: Administrar antibiótico 2x/día, control en 10 días..."
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          name="observations"
          defaultValue={visit?.observations}
          rows={2}
          placeholder="Observaciones adicionales..."
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Próximo control */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Próximo control</label>
        <input
          type="date"
          name="nextControl"
          defaultValue={visit?.nextControl || undefined}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

// ── Wrapper con submit guard ───────────────────────────────────────────────────
function VisitFormWrapper({
  visit,
  onClose,
}: {
  visit?: VeterinaryVisit;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setSubmitError(null);
    setLoading(true);
    try {
      if (visit) {
        await editVisit(visit.id, formData);
      } else {
        await addVisit(formData);
      }
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      <VisitFormFields visit={visit} />

      {submitError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {loading ? 'Guardando…' : visit ? 'Guardar cambios' : 'Registrar atención'}
        </button>
      </div>
    </form>
  );
}

// ── Botón agregar ─────────────────────────────────────────────────────────────
export function AddVisitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Agregar atención
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nueva atención veterinaria">
        <VisitFormWrapper onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

// ── Botón editar ──────────────────────────────────────────────────────────────
export function EditVisitButton({ visit }: { visit: VeterinaryVisit }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-indigo-500 transition-colors p-1"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar atención">
        <VisitFormWrapper visit={visit} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
