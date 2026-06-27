import { getDbData } from '@/lib/db';
import {
  Bone, ShoppingCart, AlertCircle, RefreshCw, Clock,
  Bell, BellOff, MapPin, DollarSign, Calendar, Package
} from 'lucide-react';
import { updateFoodQuantity } from '@/app/actions/food';
import { AddFoodButton, EditFoodButton } from './FoodForms';

export default async function AlimentoPage() {
  const data = await getDbData();
  const food = data.food;

  const hasFood = food.brand !== 'Sin registrar' || food.foodName !== '';

  // Calcular días restantes (usando kg internamente siempre)
  const totalGrams = food.remainingQuantityKg * 1000;
  const daysLeft = food.dailyRationGrams > 0 ? Math.floor(totalGrams / food.dailyRationGrams) : 0;
  const isLow = daysLeft <= food.alertThresholdDays;

  const pct = food.totalQuantityKg > 0
    ? Math.min(100, (food.remainingQuantityKg / food.totalQuantityKg) * 100)
    : 0;

  // Mostrar cantidades en la unidad guardada
  const displayUnit = food.unit || 'kg';
  const totalDisplay = displayUnit === 'g' ? food.totalQuantityKg * 1000 : food.totalQuantityKg;
  const remainingDisplay = displayUnit === 'g' ? food.remainingQuantityKg * 1000 : food.remainingQuantityKg;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bone className="text-amber-600" /> Control de Alimento
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de comida de {data.dog.name}</p>
        </div>
        <AddFoodButton />
      </div>

      {/* Empty state */}
      {!hasFood ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-amber-200 rounded-xl p-12 text-center">
          <div className="bg-amber-50 p-5 rounded-full mb-4">
            <Bone className="w-12 h-12 text-amber-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin alimento registrado</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Registra el alimento de {data.dog.name} para llevar el control del stock, días restantes y horarios de comida.
          </p>
          <div className="scale-110">
            <AddFoodButton />
          </div>
        </div>
      ) : (
        <>
          {/* Main card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header del saco */}
            <div className="bg-amber-600 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs font-medium uppercase tracking-wide">Alimento activo</p>
                <h2 className="text-xl font-bold text-white">
                  {food.foodName || food.brand}
                  {food.foodName && food.brand && food.brand !== 'Sin registrar' && (
                    <span className="text-amber-200 font-normal text-base ml-2">— {food.brand}</span>
                  )}
                </h2>
                {food.foodType && (
                  <p className="text-amber-100 text-sm">{food.foodType}</p>
                )}
              </div>
              <EditFoodButton food={food} />
            </div>

            <div className="p-6 space-y-6">
              {/* Alerta stock bajo */}
              {isLow && hasFood && (
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    ⚠ Stock bajo. Quedan aproximadamente {daysLeft} día{daysLeft !== 1 ? 's' : ''} de alimento.
                  </span>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-500 text-xs mb-1">Ración diaria</p>
                  <p className="text-xl font-bold text-gray-800">{food.dailyRationGrams}g</p>
                  <p className="text-xs text-gray-400">{food.timesPerDay} comida{food.timesPerDay !== 1 ? 's' : ''}/día</p>
                </div>
                <div className={`p-4 rounded-lg border relative overflow-hidden ${isLow ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-gray-500 text-xs mb-1">Días restantes est.</p>
                  <p className={`text-xl font-bold ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>~{daysLeft} días</p>
                  <p className="text-xs text-gray-400">Basado en ración diaria</p>
                </div>
                {food.price != null && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-gray-500 text-xs mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Precio
                    </p>
                    <p className="text-xl font-bold text-gray-800">${food.price.toLocaleString('es-CL')}</p>
                  </div>
                )}
              </div>

              {/* Barra de stock */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 text-sm">Estado del saco</span>
                  <span className="font-bold text-gray-800 text-sm">
                    {remainingDisplay.toFixed(displayUnit === 'kg' ? 2 : 0)} / {totalDisplay.toFixed(displayUnit === 'kg' ? 2 : 0)} {displayUnit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${isLow ? 'bg-orange-500' : 'bg-amber-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct.toFixed(0)}% del saco</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                {food.purchaseDate && (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    <span>Comprado: <strong>{food.purchaseDate}</strong></span>
                  </div>
                )}
                {food.openDate && (
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>Abierto: <strong>{food.openDate}</strong></span>
                  </div>
                )}
                {food.purchasePlace && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>Lugar: <strong>{food.purchasePlace}</strong></span>
                  </div>
                )}
              </div>

              {/* Horarios */}
              {food.mealTimes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600" /> Horarios de comida
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {food.mealTimes.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        <Clock className="w-3 h-3" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recordatorio */}
              <div className="flex items-center gap-3 text-sm">
                {food.reminderActive ? (
                  <>
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span className="text-gray-700">
                      Recordatorio activo — <strong>{food.reminderMinutes} min</strong> antes de cada comida
                    </span>
                  </>
                ) : (
                  <>
                    <BellOff className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Recordatorio desactivado</span>
                  </>
                )}
              </div>

              {/* Acción rápida: actualizar cantidad */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" /> Actualizar cantidad restante rápido
                </h3>
                <form action={updateFoodQuantity} className="flex gap-2">
                  <input
                    type="number"
                    step="0.001"
                    name="quantity"
                    defaultValue={food.remainingQuantityKg}
                    min="0"
                    required
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder={`Cantidad en kg`}
                  />
                  <button
                    type="submit"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" /> Actualizar
                  </button>
                </form>
                <p className="text-xs text-gray-400 mt-1">
                  Ingresa la cantidad en kg. El total se ajustará automáticamente.
                </p>
              </div>

              {/* Próxima compra estimada */}
              {food.purchaseDate && food.dailyRationGrams > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    Si empezaste el {food.openDate || food.purchaseDate}, el saco debería durar hasta aprox.{' '}
                    <strong className="text-amber-800">
                      {(() => {
                        const start = food.openDate || food.purchaseDate;
                        if (!start) return '—';
                        const d = new Date(start);
                        const totalDays = food.totalQuantityKg > 0
                          ? Math.floor((food.totalQuantityKg * 1000) / food.dailyRationGrams)
                          : 0;
                        d.setDate(d.getDate() + totalDays);
                        return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                      })()}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
