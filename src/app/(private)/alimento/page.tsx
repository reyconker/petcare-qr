import { getDbData } from '@/lib/db';
import { Bone, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';
import { updateFoodQuantity, registerFoodPurchase, updateFoodSettings } from '@/app/actions/food';

export default async function AlimentoPage() {
  const data = await getDbData();
  const food = data.food;

  const totalGrams = food.remainingQuantityKg * 1000;
  const daysLeft = food.dailyRationGrams > 0 ? Math.floor(totalGrams / food.dailyRationGrams) : 0;
  const isLow = daysLeft <= food.alertThresholdDays;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bone className="text-amber-600" /> Control de Alimento
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de comida de {data.dog.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          <div className="w-full md:w-1/3 flex flex-col items-center text-center p-6 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
              <Bone className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{food.brand}</h2>
            <p className="text-amber-700 font-medium">{food.foodType}</p>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Ración Diaria</p>
                <p className="text-xl font-bold text-gray-800">{food.dailyRationGrams}g</p>
                <p className="text-xs text-gray-400">({food.timesPerDay} veces al día)</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 relative overflow-hidden">
                <p className="text-gray-500 text-sm mb-1">Días Restantes Est.</p>
                <p className={`text-xl font-bold ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>~{daysLeft} días</p>
                <p className="text-xs text-gray-400">Basado en consumo actual</p>
                {isLow && (
                  <div className="absolute top-0 right-0 bg-orange-500 text-white p-1 rounded-bl-lg">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Estado del Saco</span>
                <span className="font-bold text-gray-800">{food.remainingQuantityKg}kg / {food.totalQuantityKg}kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full ${isLow ? 'bg-orange-500' : 'bg-amber-500'}`} 
                  style={{ width: `${Math.min(100, (food.remainingQuantityKg / (food.totalQuantityKg > 0 ? food.totalQuantityKg : 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t">
              <ShoppingCart className="w-4 h-4" />
              <span>Última compra: {food.purchaseDate}</span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <form action={updateFoodQuantity} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">Ajustar cantidad actual (kg)</h3>
                <div className="flex gap-2">
                  <input type="number" step="0.1" name="quantity" defaultValue={food.remainingQuantityKg} className="w-full border rounded px-3 py-1.5 text-sm" required />
                  <button type="submit" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 rounded flex items-center justify-center transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <form action={registerFoodPurchase} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-sm mb-2 text-amber-800">Registrar nuevo saco (kg)</h3>
                <div className="flex gap-2">
                  <input type="number" step="0.1" name="quantity" placeholder="Ej. 15" className="w-full border rounded px-3 py-1.5 text-sm" required />
                  <input type="hidden" name="brand" value={food.brand} />
                  <input type="hidden" name="foodType" value={food.foodType} />
                  <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-3 rounded text-sm font-medium transition-colors">
                    Añadir
                  </button>
                </div>
              </form>
            </div>
            {/* Configuración */}
            <div className="pt-4 border-t mt-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">Configuración de Consumo</h3>
              <form action={updateFoodSettings} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ración Diaria (g)</label>
                  <input type="number" name="dailyRationGrams" defaultValue={food.dailyRationGrams} min="1" required className="w-full border rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Veces al día</label>
                  <input type="number" name="timesPerDay" defaultValue={food.timesPerDay} min="1" required className="w-full border rounded px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Umbral de Alerta (días)</label>
                  <div className="flex gap-2">
                    <input type="number" name="alertThresholdDays" defaultValue={food.alertThresholdDays} min="1" required className="w-full border rounded px-3 py-1.5 text-sm" />
                    <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded text-sm transition-colors">
                      Guardar
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
