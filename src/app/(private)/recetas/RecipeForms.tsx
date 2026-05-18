'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { addRecipe, editRecipe } from '@/app/actions/recipes';
import { Recipe, Treatment } from '@/types';
import { Pencil, Eye } from 'lucide-react';

type TreatmentOption = Pick<Treatment, 'id' | 'name'>;

// ─────────────────────────────────────────────
// Shared treatment select component
// ─────────────────────────────────────────────
function TreatmentSelect({ treatments, defaultValue }: { treatments: TreatmentOption[]; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Tratamiento Asociado</label>
      <select name="relatedTreatmentId" defaultValue={defaultValue ?? ''} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
        <option value="">— Ninguno —</option>
        {treatments.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────
// RecipeForm fields (shared)
// ─────────────────────────────────────────────
function RecipeFormFields({
  treatments,
  defaults,
}: {
  treatments: TreatmentOption[];
  defaults?: Partial<Recipe>;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Título / Motivo *</label>
        <input type="text" name="title" defaultValue={defaults?.title} required placeholder="Ej: Tratamiento Otitis" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
        <input type="text" name="diagnosis" defaultValue={defaults?.diagnosis} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha *</label>
          <input type="date" name="date" defaultValue={defaults?.date} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Veterinario</label>
          <input type="text" name="vetName" defaultValue={defaults?.vetName} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Clínica</label>
        <input type="text" name="clinic" defaultValue={defaults?.clinic} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <TreatmentSelect treatments={treatments} defaultValue={defaults?.relatedTreatmentId} />
      <div>
        <label className="block text-sm font-medium text-gray-700">Foto de la Receta (opcional)</label>
        <input
          type="file"
          name="imageFile"
          accept="image/jpeg, image/png, image/webp, application/pdf"
          className="mt-1 w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100 cursor-pointer"
        />
        <input type="hidden" name="imageUrl" value={defaults?.imageUrl || ''} />
        {defaults?.imageUrl && (
          <p className="text-xs text-gray-400 mt-1">Ya tiene un archivo subido. Sube uno nuevo para reemplazarlo.</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Indicaciones Generales *</label>
        <textarea name="instructions" defaultValue={defaults?.instructions} required rows={3} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></textarea>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// AddRecipeButton
// ─────────────────────────────────────────────
export function AddRecipeButton({ treatments }: { treatments: TreatmentOption[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      >
        Añadir Receta
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Subir Nueva Receta">
        <form
          action={async (formData) => {
            await addRecipe(formData);
            setIsOpen(false);
          }}
          className="space-y-4"
        >
          <RecipeFormFields treatments={treatments} />
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium">Guardar Receta</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// EditRecipeButton
// ─────────────────────────────────────────────
export function EditRecipeButton({ recipe, treatments }: { recipe: Recipe; treatments: TreatmentOption[] }) {
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar Receta">
        <form
          action={async (formData) => {
            await editRecipe(recipe.id, formData);
            setIsOpen(false);
          }}
          className="space-y-4"
        >
          <RecipeFormFields treatments={treatments} defaults={recipe} />
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// ViewRecipeButton
// ─────────────────────────────────────────────
export function ViewRecipeButton({ recipe }: { recipe: Recipe }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-auto bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-800 font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" /> Ver detalle completo
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Receta: ${recipe.title}`}>
        <div className="space-y-6">
          <div className="bg-gray-100 rounded-xl overflow-hidden w-full h-64 md:h-96 relative flex items-center justify-center">
            {recipe.imageUrl ? (
              <img src={recipe.imageUrl} alt={recipe.title} className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-gray-400">Sin imagen</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
            <div>
              <p className="text-gray-500">Fecha</p>
              <p className="font-bold text-gray-800">{recipe.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Diagnóstico</p>
              <p className="font-bold text-gray-800">{recipe.diagnosis}</p>
            </div>
            <div>
              <p className="text-gray-500">Veterinario</p>
              <p className="font-bold text-gray-800">{recipe.vetName}</p>
            </div>
            <div>
              <p className="text-gray-500">Clínica</p>
              <p className="font-bold text-gray-800">{recipe.clinic || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm mb-1">Indicaciones</p>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">{recipe.instructions}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
