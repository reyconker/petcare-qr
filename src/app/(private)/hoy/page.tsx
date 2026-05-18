import { getDbData } from '@/lib/db';
import { markDoseAsGiven } from '@/app/actions/treatments';
import { CheckCircle, Clock, AlertTriangle, Pill, Bone } from 'lucide-react';

export default async function HoyPage() {
  const data = await getDbData();
  const today = new Date().toISOString().split('T')[0];

  // Active treatments
  const activeTreatments = data.treatments.filter(t => t.state === 'activo');

  // Food
  const totalGrams = data.food.remainingQuantityKg * 1000;
  const foodDaysLeft = Math.floor(totalGrams / data.food.dailyRationGrams);
  const isFoodLow = foodDaysLeft <= data.food.alertThresholdDays;

  // Vaccines
  const upcomingVaccines = data.vaccines.filter(v => v.state === 'próxima' || v.state === 'vencida');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hoy para {data.dog.name}</h1>
        <p className="text-gray-500 mt-1">Control diario y tareas pendientes.</p>
      </div>

      {/* Alertas */}
      {(isFoodLow || upcomingVaccines.length > 0) && (
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-xl space-y-2">
          <h2 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" /> Alertas Importantes
          </h2>
          {isFoodLow && (
            <p className="text-orange-700 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              La comida se acabará en aproximadamente {foodDaysLeft} días.
            </p>
          )}
          {upcomingVaccines.map(v => (
            <p key={v.id} className="text-orange-700 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              La {v.type} {v.name} está {v.state}.
            </p>
          ))}
        </div>
      )}

      {/* Tratamientos de hoy */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Pill className="text-teal-600" /> Tratamientos de Hoy
        </h2>
        {activeTreatments.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
            No hay tratamientos médicos activos para hoy.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTreatments.map(treatment => {
              const dosesPerDay = 24 / treatment.frequencyHours;
              const dosesGivenToday = data.doseHistory.filter(d => 
                d.treatmentId === treatment.id && d.givenAt.startsWith(today)
              ).length;
              
              const isPending = dosesGivenToday < dosesPerDay;

              return (
                <div key={treatment.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{treatment.name}</h3>
                      <p className="text-teal-600 text-sm">{treatment.doseAmount} {treatment.unit}</p>
                    </div>
                    {isPending ? (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> PENDIENTE
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> AL DÍA
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mb-4">
                    Se debe dar cada {treatment.frequencyHours} horas.
                    <br/>
                    Dosis dadas hoy: {dosesGivenToday} de {dosesPerDay}.
                  </p>

                  <form action={async () => {
                    'use server';
                    await markDoseAsGiven(treatment.id, treatment.name, treatment.doseAmount, treatment.unit);
                  }}>
                    <button 
                      type="submit" 
                      disabled={!isPending}
                      className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                        isPending 
                          ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isPending ? 'Marcar como dada' : 'Todas las dosis completadas hoy'}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comida */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Bone className="text-amber-600" /> Comida
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-500 text-sm">Ración diaria sugerida</p>
              <p className="font-bold text-gray-800 text-lg">{data.food.dailyRationGrams} g</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Comida restante</p>
              <p className="font-bold text-gray-800 text-lg">{data.food.remainingQuantityKg} kg</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            A este ritmo, la comida alcanzará para aproximadamente <strong>{foodDaysLeft} días</strong>.
          </p>
        </div>
      </div>

    </div>
  );
}
