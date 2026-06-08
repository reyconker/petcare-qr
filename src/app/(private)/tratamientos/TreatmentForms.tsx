'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addTreatment, editTreatment } from '@/app/actions/treatments';
import { Treatment } from '@/types';
import { Pencil } from 'lucide-react';

// ─── Shared sub-form ────────────────────────────────────────────────────────
function TreatmentFormFields({ treatment }: { treatment?: Treatment }) {
  const [isPermanent, setIsPermanent] = useState(treatment?.isPermanent ?? false);

  return (
    <>
      {/* Hidden field so formData always carries isPermanent */}
      <input type="hidden" name="isPermanent" value={isPermanent ? 'true' : 'false'} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre del Medicamento</label>
        <input
          type="text"
          name="name"
          defaultValue={treatment?.name}
          required
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Motivo</label>
        <input
          type="text"
          name="reason"
          defaultValue={treatment?.reason}
          required
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Tipo de tratamiento toggle */}
      <div>
        <p className="block text-sm font-medium text-gray-700 mb-2">Tipo de tratamiento</p>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setIsPermanent(false)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              !isPermanent
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Temporal
          </button>
          <button
            type="button"
            onClick={() => setIsPermanent(true)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              isPermanent
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Permanente
          </button>
        </div>
        {isPermanent && (
          <p className="mt-1 text-xs text-teal-600">
            Sin fecha de término. Stock y dosis se controlan normalmente.
          </p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
          <input
            type="date"
            name="startDate"
            defaultValue={treatment?.startDate}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className={isPermanent ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-medium text-gray-700">
            Fecha Fin{!isPermanent && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <input
            type="date"
            name="endDate"
            defaultValue={treatment?.endDate}
            required={!isPermanent}
            disabled={isPermanent}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm disabled:bg-gray-100"
          />
          {isPermanent && (
            <p className="text-xs text-gray-400 mt-1">No aplica</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Frecuencia (horas)</label>
          <input
            type="number"
            min="1"
            step="1"
            name="frequencyHours"
            defaultValue={treatment?.frequencyHours}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dosis por Toma</label>
          <input
            type="number"
            min="0"
            step="any"
            name="doseAmount"
            defaultValue={treatment?.doseAmount}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidad (ej. ml, comp)</label>
          <input
            type="text"
            name="unit"
            defaultValue={treatment?.unit}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock inicial del medicamento</label>
          <input
            type="number"
            min="0"
            step="any"
            name="initialQuantity"
            defaultValue={treatment?.initialQuantity}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Edit-only: remaining quantity and state */}
      {treatment && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock restante</label>
            <input
              type="number"
              min="0"
              step="any"
              name="remainingQuantity"
              defaultValue={treatment.remainingQuantity}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              name="state"
              defaultValue={treatment.state}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
        <textarea
          name="notes"
          defaultValue={treatment?.notes}
          rows={2}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

// ─── Add button ──────────────────────────────────────────────────────────────
export function AddTreatmentButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        Añadir Tratamiento
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Tratamiento">
        <form
          action={async (formData) => {
            await addTreatment(formData);
            setIsOpen(false);
          }}
          className="space-y-4"
        >
          <TreatmentFormFields />
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─── Edit button ─────────────────────────────────────────────────────────────
export function EditTreatmentButton({ treatment }: { treatment: Treatment }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-teal-500 transition-colors p-2"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Tratamiento">
        <form
          action={async (formData) => {
            await editTreatment(treatment.id, formData);
            setIsOpen(false);
          }}
          className="space-y-4"
        >
          <TreatmentFormFields treatment={treatment} />
          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
