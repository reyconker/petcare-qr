import { getDbData } from '@/lib/db';
import { Pill, Bone, Syringe, AlertCircle, Stethoscope } from 'lucide-react';
import { OnboardingChecklist } from './OnboardingChecklist';

export default async function DashboardPage() {
  const data = await getDbData();
  
  // Calculations
  const activeTreatments = data.treatments.filter(t => t.state === 'activo');
  const nextVaccine = data.vaccines.find(v => v.state === 'próxima');
  const foodRemainingDays = Math.floor((data.food.remainingQuantityKg * 1000) / data.food.dailyRationGrams);
  const lastPrescription = data.prescriptions[data.prescriptions.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Hola, {data.dog.owner.name.split(' ')[0]} 👋</h1>
      </div>

      <OnboardingChecklist 
        hasFood={data.food.brand !== 'Sin registrar' && data.food.brand !== ''}
        hasVaccines={data.vaccines.length > 0}
        hasTreatments={data.treatments.length > 0}
        qrEnabled={data.qrSettings.enabled}
      />

      {/* Alerts Section MVP */}
      {foodRemainingDays <= 7 && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-center gap-3">
          <AlertCircle className="text-orange-500 w-6 h-6" />
          <p className="text-orange-800 font-medium">¡Queda alimento para {foodRemainingDays} días! Recuerda comprar pronto.</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Medicamentos Activos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-teal-100 p-3 rounded-lg text-teal-600">
              <Pill className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Tratamientos</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{activeTreatments.length}</p>
          <p className="text-gray-500 text-sm">Activos en este momento</p>
        </div>

        {/* Alimento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
              <Bone className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Alimento</h2>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{foodRemainingDays} días</p>
          <p className="text-gray-500 text-sm">De comida restante est.</p>
        </div>

        {/* Vacunas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Syringe className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Próx. Vacuna</h2>
          </div>
          {nextVaccine ? (
            <>
              <p className="text-xl font-bold text-gray-800 mb-1 truncate">{nextVaccine.name}</p>
              <p className="text-gray-500 text-sm">Fecha: {nextVaccine.nextDate}</p>
            </>
          ) : (
            <p className="text-gray-500">No hay vacunas próximas</p>
          )}
        </div>

        {/* Último Control */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Último Control</h2>
          </div>
          {lastPrescription ? (
            <>
              <p className="text-xl font-bold text-gray-800 mb-1 truncate">{lastPrescription.diagnosis}</p>
              <p className="text-gray-500 text-sm">{lastPrescription.date} - {lastPrescription.veterinarian}</p>
            </>
          ) : (
            <p className="text-gray-500">Sin historial</p>
          )}
        </div>

      </div>
    </div>
  );
}
