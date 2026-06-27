'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addCenter, editCenter } from '@/app/actions/veterinary-centers';
import { VeterinaryCenter } from '@/types';
import { Pencil, Plus, AlertCircle, Phone, MapPin } from 'lucide-react';

// ── Campos del formulario ─────────────────────────────────────────────────────
function CenterFormFields({ center }: { center?: VeterinaryCenter }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre de la clínica <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={center?.name}
          required
          placeholder="Ej: Clínica Veterinaria Las Lilas"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Dirección
        </label>
        <input
          type="text"
          name="address"
          defaultValue={center?.address}
          placeholder="Ej: Av. Providencia 1234, Santiago"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
          <Phone className="w-3.5 h-3.5" /> Teléfono de contacto
        </label>
        <input
          type="tel"
          name="phone"
          defaultValue={center?.phone}
          placeholder="Ej: +56 2 1234 5678"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Veterinario/a de referencia</label>
          <input
            type="text"
            name="vetName"
            defaultValue={center?.vetName}
            placeholder="Ej: Dra. García"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Especialidad</label>
          <input
            type="text"
            name="specialty"
            defaultValue={center?.specialty}
            placeholder="Ej: Dermatología"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          name="observations"
          defaultValue={center?.observations}
          rows={2}
          placeholder="Horarios, notas importantes..."
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

// ── Wrapper con submit guard ───────────────────────────────────────────────────
function CenterFormWrapper({
  center,
  onClose,
}: {
  center?: VeterinaryCenter;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setSubmitError(null);
    setLoading(true);
    try {
      if (center) {
        await editCenter(center.id, formData);
      } else {
        await addCenter(formData);
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
      <CenterFormFields center={center} />

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
          className="px-4 py-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {loading ? 'Guardando…' : center ? 'Guardar cambios' : 'Agregar clínica'}
        </button>
      </div>
    </form>
  );
}

// ── Botón agregar ─────────────────────────────────────────────────────────────
export function AddCenterButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Agregar clínica
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nueva clínica veterinaria">
        <CenterFormWrapper onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

// ── Botón editar ──────────────────────────────────────────────────────────────
export function EditCenterButton({ center }: { center: VeterinaryCenter }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-teal-500 transition-colors p-1"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar clínica">
        <CenterFormWrapper center={center} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
