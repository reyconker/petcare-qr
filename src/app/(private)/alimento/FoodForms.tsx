'use client';

import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { saveFoodRecord } from '@/app/actions/food';
import { FoodControl } from '@/types';
import { Pencil, Plus, X, AlertCircle, Clock } from 'lucide-react';

// ── Selector de horarios de comida ────────────────────────────────────────────
function MealTimesEditor({
  initialTimes,
  onChange,
}: {
  initialTimes: string[];
  onChange: (times: string[]) => void;
}) {
  const [times, setTimes] = useState<string[]>(initialTimes);
  const [newTime, setNewTime] = useState('');

  function addTime() {
    if (!newTime) return;
    const next = [...times, newTime].sort();
    setTimes(next);
    onChange(next);
    setNewTime('');
  }

  function removeTime(idx: number) {
    const next = times.filter((_, i) => i !== idx);
    setTimes(next);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
        <Clock className="w-4 h-4 text-amber-600" /> Horarios de comida
        <span className="text-gray-400 font-normal text-xs ml-1">— opcional</span>
      </label>
      <div className="flex gap-2">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addTime}
          className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {times.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {times.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-2 py-1 rounded-full"
            >
              {t}
              <button type="button" onClick={() => removeTime(i)} className="ml-0.5 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Campos del formulario ─────────────────────────────────────────────────────
function FoodFormFields({ food }: { food?: FoodControl }) {
  const [unit, setUnit] = useState(food?.unit ?? 'kg');
  const [reminderActive, setReminderActive] = useState(food?.reminderActive ?? false);
  const [mealTimes, setMealTimes] = useState<string[]>(food?.mealTimes ?? []);

  const totalDisplay = food ? (unit === 'g' ? food.totalQuantityKg * 1000 : food.totalQuantityKg) : 0;
  const remainingDisplay = food ? (unit === 'g' ? food.remainingQuantityKg * 1000 : food.remainingQuantityKg) : 0;

  return (
    <>
      {/* Hidden mealTimes serialized as JSON */}
      <input type="hidden" name="mealTimes" value={JSON.stringify(mealTimes)} />
      <input type="hidden" name="reminderActive" value={reminderActive ? 'true' : 'false'} />

      {/* Nombre y Marca */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del alimento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="foodName"
            defaultValue={food?.foodName}
            required
            placeholder="Ej: Adulto Raza Grande"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Marca</label>
          <input
            type="text"
            name="brand"
            defaultValue={food?.brand === 'Sin registrar' ? '' : food?.brand}
            placeholder="Ej: Royal Canin"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de alimento</label>
        <select
          name="foodType"
          defaultValue={food?.foodType || 'Seco'}
          className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="Seco">Seco</option>
          <option value="Húmedo">Húmedo</option>
          <option value="Semi-húmedo">Semi-húmedo</option>
          <option value="BARF/Natural">BARF / Natural</option>
          <option value="Casero">Casero</option>
          <option value="Mixto">Mixto</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {/* Unidad + Cantidades */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de medida</label>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden w-40">
          {(['kg', 'g'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                unit === u ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <input type="hidden" name="unit" value={unit} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cantidad total comprada ({unit}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalQuantityKg"
            min="0"
            step="0.001"
            defaultValue={totalDisplay || undefined}
            required
            placeholder={unit === 'kg' ? 'Ej: 15' : 'Ej: 15000'}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cantidad restante ({unit}) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="remainingQuantityKg"
            min="0"
            step="0.001"
            defaultValue={remainingDisplay || undefined}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de compra</label>
          <input
            type="date"
            name="purchaseDate"
            defaultValue={food?.purchaseDate || undefined}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de apertura del saco</label>
          <input
            type="date"
            name="openDate"
            defaultValue={food?.openDate || undefined}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Lugar y Precio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Lugar de compra</label>
          <input
            type="text"
            name="purchasePlace"
            defaultValue={food?.purchasePlace}
            placeholder="Ej: Veterinaria, Supermercado"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            defaultValue={food?.price ?? undefined}
            placeholder="Ej: 25000"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Ración y Comidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ración diaria (g) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="dailyRationGrams"
            min="1"
            step="1"
            defaultValue={food?.dailyRationGrams ?? 200}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comidas por día <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="timesPerDay"
            min="1"
            step="1"
            defaultValue={food?.timesPerDay ?? 2}
            required
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Alerta (días)</label>
          <input
            type="number"
            name="alertThresholdDays"
            min="1"
            step="1"
            defaultValue={food?.alertThresholdDays ?? 7}
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Horarios */}
      <MealTimesEditor initialTimes={food?.mealTimes ?? []} onChange={setMealTimes} />

      {/* Recordatorio */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-amber-900">Recordatorio de comida</p>
          <button
            type="button"
            onClick={() => setReminderActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reminderActive ? 'bg-amber-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reminderActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {reminderActive && (
          <div>
            <label className="block text-xs text-amber-800 mb-1">
              Minutos de aviso antes de la hora de comida
            </label>
            <input
              type="number"
              name="reminderMinutes"
              min="0"
              step="1"
              defaultValue={food?.reminderMinutes ?? 15}
              className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>
        )}
        {!reminderActive && (
          <input type="hidden" name="reminderMinutes" value={food?.reminderMinutes ?? 15} />
        )}
        <p className="text-xs text-amber-700">
          La estructura de recordatorios se guarda. Las notificaciones push se activarán en una próxima versión.
        </p>
      </div>
    </>
  );
}

// ── Formulario con submit guard ───────────────────────────────────────────────
function FoodFormWrapper({
  food,
  onClose,
}: {
  food?: FoodControl;
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setSubmitError(null);
    setLoading(true);
    try {
      await saveFoodRecord(formData);
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Error inesperado. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-4">
      <FoodFormFields food={food} />

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
          className="px-4 py-2.5 text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {loading ? 'Guardando…' : food ? 'Guardar cambios' : 'Registrar alimento'}
        </button>
      </div>
    </form>
  );
}

// ── Botón agregar ─────────────────────────────────────────────────────────────
export function AddFoodButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Registrar alimento
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Registrar alimento">
        <FoodFormWrapper onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

// ── Botón editar ──────────────────────────────────────────────────────────────
export function EditFoodButton({ food }: { food: FoodControl }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-900 text-sm font-medium bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" /> Editar
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Editar alimento">
        <FoodFormWrapper food={food} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
