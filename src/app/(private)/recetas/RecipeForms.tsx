'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/Modal';
import { addRecipe, editRecipe } from '@/app/actions/recipes';
import { Recipe, Treatment } from '@/types';
import { Pencil, Eye, FileText, Image as ImageIcon, AlertCircle, X } from 'lucide-react';
import { validateRecipeFile } from '@/lib/recipeValidation';

type TreatmentOption = Pick<Treatment, 'id' | 'name'>;

// ── File input with preview ───────────────────────────────────────────────
function FileInput({
  existingUrl,
  onError,
}: {
  existingUrl?: string;
  onError: (msg: string | null) => void;
}) {
  const [preview, setPreview] = useState<{ url: string; isPdf: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      onError(null);
      return;
    }
    const err = validateRecipeFile(file);
    if (err) {
      onError(err);
      e.target.value = '';
      setPreview(null);
      return;
    }
    onError(null);
    if (file.type === 'application/pdf') {
      setPreview({ url: '', isPdf: true });
    } else {
      setPreview({ url: URL.createObjectURL(file), isPdf: false });
    }
  }

  function clearFile() {
    if (inputRef.current) inputRef.current.value = '';
    setPreview(null);
    onError(null);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Archivo (foto o PDF) <span className="text-gray-400 font-normal">— opcional</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name="imageFile"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleChange}
          className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-lg p-1"
        />
        {preview && (
          <button type="button" onClick={clearFile} className="text-gray-400 hover:text-red-500 transition-colors" title="Quitar archivo">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">JPG / PNG / WEBP (máx. 5 MB) · PDF (máx. 10 MB)</p>

      {/* Preview */}
      {preview?.isPdf && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 p-3 rounded-lg text-sm text-orange-700">
          <FileText className="w-5 h-5 flex-shrink-0" />
          PDF seleccionado. Se guardará de forma segura.
        </div>
      )}
      {preview?.url && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
          <img src={preview.url} alt="Vista previa" className="w-full h-full object-contain bg-gray-50" />
        </div>
      )}
      {/* Existing file indicator */}
      {!preview && existingUrl && (
        <p className="text-xs text-teal-600">Ya tiene un archivo guardado. Selecciona uno nuevo para reemplazarlo.</p>
      )}
    </div>
  );
}

// ── Treatment selector ────────────────────────────────────────────────────
function TreatmentSelect({
  treatments,
  defaultValue,
}: {
  treatments: TreatmentOption[];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Tratamiento Asociado</label>
      <select
        name="relatedTreatmentId"
        defaultValue={defaultValue ?? ''}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
      >
        <option value="">— Ninguno —</option>
        {treatments.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}

// ── Shared form fields ────────────────────────────────────────────────────
function RecipeFormFields({
  treatments,
  defaults,
  fileError,
  setFileError,
}: {
  treatments: TreatmentOption[];
  defaults?: Partial<Recipe>;
  fileError: string | null;
  setFileError: (e: string | null) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">Título / Motivo <span className="text-red-500">*</span></label>
        <input
          type="text"
          name="title"
          defaultValue={defaults?.title}
          required
          placeholder="Ej: Tratamiento Otitis"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
        <input type="text" name="diagnosis" defaultValue={defaults?.diagnosis} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha <span className="text-red-500">*</span></label>
          <input type="date" name="date" defaultValue={defaults?.date} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Veterinario/a</label>
          <input type="text" name="vetName" defaultValue={defaults?.vetName} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Clínica</label>
        <input type="text" name="clinic" defaultValue={defaults?.clinic} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
      </div>

      <TreatmentSelect treatments={treatments} defaultValue={defaults?.relatedTreatmentId} />

      {/* File upload with client-side validation */}
      <FileInput existingUrl={defaults?.imageUrl} onError={setFileError} />
      <input type="hidden" name="imageUrl" value={defaults?.imageUrl || ''} />

      {fileError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Indicaciones Generales <span className="text-red-500">*</span>
        </label>
        <textarea
          name="instructions"
          defaultValue={defaults?.instructions}
          required
          rows={3}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

// ── Wrapper with error state + submit guard ───────────────────────────────
function RecipeFormWrapper({
  treatments,
  defaults,
  onSubmit,
  onClose,
  submitLabel,
}: {
  treatments: TreatmentOption[];
  defaults?: Partial<Recipe>;
  onSubmit: (formData: FormData) => Promise<void>;
  onClose: () => void;
  submitLabel: string;
}) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    if (fileError) return; // Block submission if file is invalid
    setSubmitError(null);
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Error inesperado. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      <RecipeFormFields
        treatments={treatments}
        defaults={defaults}
        fileError={fileError}
        setFileError={setFileError}
      />

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
          disabled={!!fileError || loading}
          className="px-4 py-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {loading ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── AddRecipeButton ───────────────────────────────────────────────────────
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
        <RecipeFormWrapper
          treatments={treatments}
          onSubmit={addRecipe}
          onClose={() => setIsOpen(false)}
          submitLabel="Guardar Receta"
        />
      </Modal>
    </>
  );
}

// ── EditRecipeButton ──────────────────────────────────────────────────────
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
        <RecipeFormWrapper
          treatments={treatments}
          defaults={recipe}
          onSubmit={(formData) => editRecipe(recipe.id, formData)}
          onClose={() => setIsOpen(false)}
          submitLabel="Guardar Cambios"
        />
      </Modal>
    </>
  );
}

// ── ViewRecipeButton ──────────────────────────────────────────────────────
export function ViewRecipeButton({ recipe }: { recipe: Recipe }) {
  const [isOpen, setIsOpen] = useState(false);
  const isPdf = recipe.imageUrl?.endsWith('.pdf') || recipe.imageUrl?.includes('%2F') && recipe.imageUrl?.includes('.pdf');

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

          {/* Image / PDF / Placeholder */}
          <div className="bg-gray-100 rounded-xl overflow-hidden w-full relative flex items-center justify-center min-h-48">
            {recipe.imageUrl ? (
              isPdf ? (
                <a
                  href={recipe.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-3 p-8 text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <FileText className="w-16 h-16" />
                  <span className="font-medium text-sm">Ver / descargar PDF</span>
                </a>
              ) : (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="max-w-full max-h-80 object-contain"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-gray-400">
                <ImageIcon className="w-12 h-12 opacity-40" />
                <span className="text-sm">Sin archivo adjunto</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
            <div>
              <p className="text-gray-500">Fecha</p>
              <p className="font-bold text-gray-800">{recipe.date || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Diagnóstico</p>
              <p className="font-bold text-gray-800">{recipe.diagnosis || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Veterinario/a</p>
              <p className="font-bold text-gray-800">{recipe.vetName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Clínica</p>
              <p className="font-bold text-gray-800">{recipe.clinic || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Indicaciones</p>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">{recipe.instructions}</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
