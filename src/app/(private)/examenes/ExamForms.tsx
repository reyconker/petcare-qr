'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/Modal';
import { addExam, editExam } from '@/app/actions/exams';
import { Exam, ExamReason } from '@/types';
import { validateRecipeFile } from '@/lib/recipeValidation';
import { Pencil, Plus, AlertCircle, FileText, Image as ImageIcon, X } from 'lucide-react';

const REASONS: { value: ExamReason; label: string }[] = [
  { value: 'cirugía', label: 'Cirugía' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'control sano', label: 'Control sano' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'otro', label: 'Otro' },
];

// ── File input con preview ─────────────────────────────────────────────────────
function ExamFileInput({
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
        Archivo del examen{' '}
        <span className="text-gray-400 font-normal">— opcional</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name="examFile"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleChange}
          className="flex-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:font-medium hover:file:bg-teal-100 cursor-pointer border border-gray-200 rounded-lg p-1"
        />
        {preview && (
          <button
            type="button"
            onClick={clearFile}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Quitar archivo"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400">JPG / PNG / WEBP (máx. 5 MB) · PDF (máx. 10 MB)</p>

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
      {!preview && existingUrl && (
        <p className="text-xs text-teal-600">Ya tiene un archivo guardado. Selecciona uno nuevo para reemplazarlo.</p>
      )}
    </div>
  );
}

// ── Campos del formulario ─────────────────────────────────────────────────────
function ExamFormFields({ exam }: { exam?: Exam }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre del examen <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={exam?.name}
          required
          placeholder="Ej: Hemograma completo"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="examDate"
            defaultValue={exam?.examDate}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Motivo</label>
          <select
            name="reason"
            defaultValue={exam?.reason || 'otro'}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Clínica / Laboratorio</label>
        <input
          type="text"
          name="clinic"
          defaultValue={exam?.clinic}
          placeholder="Ej: Lab. Central Veterinaria"
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observaciones</label>
        <textarea
          name="observations"
          defaultValue={exam?.observations}
          rows={2}
          placeholder="Resultados, valores relevantes..."
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {exam && <input type="hidden" name="existingFileUrl" value={exam.fileUrl || ''} />}
    </>
  );
}

// ── Wrapper con submit guard ───────────────────────────────────────────────────
function ExamFormWrapper({
  exam,
  onClose,
}: {
  exam?: Exam;
  onClose: () => void;
}) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    if (fileError) return;
    setSubmitError(null);
    setLoading(true);
    try {
      if (exam) {
        await editExam(exam.id, formData);
      } else {
        await addExam(formData);
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
      <ExamFormFields exam={exam} />
      <ExamFileInput existingUrl={exam?.fileUrl} onError={setFileError} />

      {fileError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
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
          className="px-4 py-2.5 text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {loading ? 'Guardando…' : exam ? 'Guardar cambios' : 'Guardar examen'}
        </button>
      </div>
    </form>
  );
}

// ── Botón agregar ─────────────────────────────────────────────────────────────
export function AddExamButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Agregar examen
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo examen">
        <ExamFormWrapper onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

// ── Botón editar ──────────────────────────────────────────────────────────────
export function EditExamButton({ exam }: { exam: Exam }) {
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar examen">
        <ExamFormWrapper exam={exam} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

// ── Botón ver archivo ─────────────────────────────────────────────────────────
export function ViewFileButton({ fileUrl }: { fileUrl: string }) {
  const isPdf = fileUrl.includes('.pdf') || fileUrl.endsWith('.pdf');
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
    >
      {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
      Ver {isPdf ? 'PDF' : 'imagen'}
    </a>
  );
}
