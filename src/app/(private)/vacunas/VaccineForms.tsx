'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addVaccine, editVaccine } from '@/app/actions/vaccines';
import { Vaccine } from '@/types';
import { Pencil } from 'lucide-react';

export function AddVaccineButton({ prefill, buttonText = "Añadir Registro" }: { prefill?: Partial<Vaccine>, buttonText?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        {buttonText}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Registro">
        <form 
          action={async (formData) => {
            await addVaccine(formData);
            setIsOpen(false);
          }} 
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" defaultValue={prefill?.type || "vacuna"} required className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
                <option value="vacuna">Vacuna</option>
                <option value="desparasitación">Desparasitación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" defaultValue={prefill?.name} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Aplicación</label>
              <input type="date" name="applicationDate" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Próxima Fecha</label>
              <input type="date" name="nextDate" required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Veterinario / Clínica</label>
            <input type="text" name="veterinarian" className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea name="notes" rows={2} className="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Guardar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function EditVaccineButton({ vaccine }: { vaccine: Vaccine }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-blue-500 transition-colors p-2"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Registro">
        <form 
          action={async (formData) => {
            await editVaccine(vaccine.id, formData);
            setIsOpen(false);
          }} 
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select name="type" defaultValue={vaccine.type} required className="mt-1 w-full border rounded-lg px-3 py-2 bg-white">
                <option value="vacuna">Vacuna</option>
                <option value="desparasitación">Desparasitación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" defaultValue={vaccine.name} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Aplicación</label>
              <input type="date" name="applicationDate" defaultValue={vaccine.applicationDate} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Próxima Fecha</label>
              <input type="date" name="nextDate" defaultValue={vaccine.nextDate} required className="mt-1 w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Veterinario / Clínica</label>
            <input type="text" name="veterinarian" defaultValue={vaccine.veterinarian} className="mt-1 w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notas</label>
            <textarea name="notes" defaultValue={vaccine.notes} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2"></textarea>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
