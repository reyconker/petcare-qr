'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { editDogProfile } from '@/app/actions/dogs';
import type { Dog, Surgery } from '@/types';

// ── Surgery list editor ────────────────────────────────────────────────
function SurgeryEditor({
  surgeries,
  onChange,
}: {
  surgeries: Surgery[];
  onChange: (s: Surgery[]) => void;
}) {
  function addSurgery() {
    onChange([...surgeries, { name: '', reason: '', date: '', notes: '' }]);
  }

  function removeSurgery(idx: number) {
    onChange(surgeries.filter((_, i) => i !== idx));
  }

  function update(idx: number, field: keyof Surgery, value: string) {
    const copy = [...surgeries];
    copy[idx] = { ...copy[idx], [field]: value };
    onChange(copy);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Cirugías Previas</label>
        <button
          type="button"
          onClick={addSurgery}
          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>

      {surgeries.length === 0 && (
        <p className="text-xs text-gray-400">Sin cirugías registradas.</p>
      )}

      {surgeries.map((s, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2 relative">
          <button
            type="button"
            onClick={() => removeSurgery(idx)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar cirugía"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500">Tipo / Nombre *</label>
              <input
                type="text"
                value={s.name}
                onChange={(e) => update(idx, 'name', e.target.value)}
                placeholder="Ej: Esterilización"
                className="mt-0.5 w-full border rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Fecha *</label>
              <input
                type="date"
                value={s.date}
                onChange={(e) => update(idx, 'date', e.target.value)}
                className="mt-0.5 w-full border rounded-lg px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Motivo</label>
            <input
              type="text"
              value={s.reason}
              onChange={(e) => update(idx, 'reason', e.target.value)}
              className="mt-0.5 w-full border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500">Observaciones</label>
            <input
              type="text"
              value={s.notes}
              onChange={(e) => update(idx, 'notes', e.target.value)}
              className="mt-0.5 w-full border rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main edit profile button + modal ──────────────────────────────────
export function EditProfileButton({ dog }: { dog: Dog }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isNeutered, setIsNeutered] = useState(dog.isNeutered);
  const [surgeries, setSurgeries] = useState<Surgery[]>(dog.surgeries ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  function openModal() {
    setIsNeutered(dog.isNeutered);
    setSurgeries(dog.surgeries ?? []);
    setError(null);
    setLoading(false);
    setIsOpen(true);
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Editar perfil
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Perfil de la Mascota">
        <form
          action={async (formData) => {
            setLoading(true);
            setError(null);
            try {
              // Inject surgeries JSON into FormData
              formData.set('surgeries', JSON.stringify(surgeries));
              await editDogProfile(formData);
              setIsOpen(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Error inesperado al guardar.');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
        >
          {/* ── Datos básicos ── */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos básicos</p>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input type="text" name="name" defaultValue={dog.name} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Especie</label>
            <select name="species" defaultValue={dog.species} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Raza</label>
              <input type="text" name="breed" defaultValue={dog.breed} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select name="gender" defaultValue={dog.gender} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
              <input type="date" name="birthDate" defaultValue={dog.birthDate} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Edad (texto, ej: &ldquo;2 años&rdquo;)</label>
              <input type="text" name="ageText" defaultValue={dog.ageText} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" step="0.1" min="0" name="weight" defaultValue={dog.weight} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input type="text" name="color" defaultValue={dog.color} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Microchip</label>
            <input type="text" name="microchip" defaultValue={dog.microchip} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Foto (JPG, PNG, WEBP)</label>
            <input type="file" name="photoFile" accept="image/jpeg, image/png, image/webp" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            <input type="hidden" name="photoUrl" value={dog.photoUrl || ''} />
            {dog.photoUrl && (
              <p className="text-xs text-gray-500 mt-1">Ya tiene una foto subida. Sube una nueva para reemplazarla.</p>
            )}
          </div>

          {/* ── Esterilización ── */}
          <hr />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Esterilización / Castración</p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isNeutered"
              checked={isNeutered}
              onChange={(e) => setIsNeutered(e.target.checked)}
              className="w-5 h-5 accent-teal-600"
            />
            <label className="text-sm text-gray-700 font-medium">Esterilizado/a o castrado/a</label>
          </div>

          {isNeutered && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de esterilización/castración</label>
              <input type="date" name="neuterDate" defaultValue={dog.neuterDate} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          {/* ── Cirugías ── */}
          <hr />
          <SurgeryEditor surgeries={surgeries} onChange={setSurgeries} />

          {/* ── Salud ── */}
          <hr />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Salud</p>

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
            <textarea
              name="emergencyNotes"
              defaultValue={dog.emergencyNotes}
              rows={3}
              placeholder="Ej: Solo manipular con bozal, alergia a penicilina, mejor acceso venoso en pata izquierda..."
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {/* ── Tutor/a ── */}
          <hr />
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos del tutor/a</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Tutor/a</label>
              <input type="text" name="ownerName" defaultValue={dog.owner.name} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="tel" name="ownerPhone" defaultValue={dog.owner.phone} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Submit error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm w-full sm:w-auto">Cancelar</button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg text-sm font-medium w-full sm:w-auto"
            >
              {loading ? 'Guardando…' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
