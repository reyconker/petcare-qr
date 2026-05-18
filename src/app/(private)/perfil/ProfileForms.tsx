'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { editDogProfile } from '@/app/actions/dogs';
import type { Dog } from '@/types';

export function EditProfileButton({ dog }: { dog: Dog }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Editar perfil
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Perfil de la Mascota">
        <form
          action={async (formData) => {
            await editDogProfile(formData);
            setIsOpen(false);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" defaultValue={dog.name} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Raza</label>
              <input type="text" name="breed" defaultValue={dog.breed} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select name="gender" defaultValue={dog.gender} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input type="date" name="birthDate" defaultValue={dog.birthDate} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Edad (texto, ej: &ldquo;2 años&rdquo;)</label>
              <input type="text" name="ageText" defaultValue={dog.ageText} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" step="0.1" min="0" name="weight" defaultValue={dog.weight} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input type="text" name="color" defaultValue={dog.color} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Microchip</label>
              <input type="text" name="microchip" defaultValue={dog.microchip} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Foto (JPG, PNG, WEBP)</label>
            <input type="file" name="photoFile" accept="image/jpeg, image/png, image/webp" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="hidden" name="photoUrl" value={dog.photoUrl || ''} />
            {dog.photoUrl && (
              <p className="text-xs text-gray-500 mt-1">Ya tiene una foto subida. Sube una nueva para reemplazarla.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alergias <span className="text-gray-400 font-normal">(separadas por coma)</span>
            </label>
            <input type="text" name="allergies" defaultValue={dog.allergies.join(', ')} placeholder="Polen, Maíz, Pollo..." className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enfermedades diagnosticadas <span className="text-gray-400 font-normal">(separadas por coma)</span>
            </label>
            <input type="text" name="diseases" defaultValue={dog.diseases.join(', ')} placeholder="Displasia, Epilepsia..." className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas de emergencia</label>
            <textarea name="emergencyNotes" defaultValue={dog.emergencyNotes} rows={2} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <hr />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos del dueño</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Dueño</label>
              <input type="text" name="ownerName" defaultValue={dog.owner.name} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="tel" name="ownerPhone" defaultValue={dog.owner.phone} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
