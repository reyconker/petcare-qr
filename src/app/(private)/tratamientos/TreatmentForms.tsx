'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addTreatment, editTreatment } from '@/app/actions/treatments';
import { Treatment } from '@/types';
import { Pencil } from 'lucide-react';

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
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Medicamento</label>
            <input type="text" name="name" required className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <input type="text" name="reason" required className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input type="date" name="startDate" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input type="date" name="endDate" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frecuencia (Horas)</label>
              <input type="number" min="1" step="1" name="frequencyHours" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dosis por Toma</label>
              <input type="number" min="0" step="any" name="doseAmount" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidad (ej. ml, comp)</label>
              <input type="text" name="unit" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantidad Total Inicial</label>
              <input type="number" min="0" step="any" name="initialQuantity" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
            <textarea name="notes" rows={2} className="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

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
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Medicamento</label>
            <input type="text" name="name" defaultValue={treatment.name} required className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <input type="text" name="reason" defaultValue={treatment.reason} required className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Inicio</label>
              <input type="date" name="startDate" defaultValue={treatment.startDate} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin</label>
              <input type="date" name="endDate" defaultValue={treatment.endDate} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Frecuencia (Horas)</label>
              <input type="number" min="1" step="1" name="frequencyHours" defaultValue={treatment.frequencyHours} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dosis por Toma</label>
              <input type="number" min="0" step="any" name="doseAmount" defaultValue={treatment.doseAmount} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Unidad</label>
              <input type="text" name="unit" defaultValue={treatment.unit} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Inicial</label>
              <input type="number" min="0" step="any" name="initialQuantity" defaultValue={treatment.initialQuantity} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Restante</label>
              <input type="number" min="0" step="any" name="remainingQuantity" defaultValue={treatment.remainingQuantity} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="state" defaultValue={treatment.state} className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
            <textarea name="notes" defaultValue={treatment.notes} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
