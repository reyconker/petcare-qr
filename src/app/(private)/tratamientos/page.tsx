import { getDbData } from '@/lib/db';
import { Pill, Calendar, Clock, AlertTriangle, CheckCircle, Trash2, Infinity as InfinityIcon } from 'lucide-react';
import { markDoseAsGiven, deleteTreatment } from '@/app/actions/treatments';
import { AddTreatmentButton, EditTreatmentButton } from './TreatmentForms';

export default async function TratamientosPage() {
  const data = await getDbData();
  const treatments = data.treatments;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="text-teal-600" /> Tratamientos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de medicamentos</p>
        </div>
        <AddTreatmentButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {treatments.map((treatment) => {
          const dosesLeft = treatment.doseAmount > 0
            ? Math.floor(treatment.remainingQuantity / treatment.doseAmount)
            : 0;
          const dosesPerDay = treatment.frequencyHours > 0 ? 24 / treatment.frequencyHours : 0;
          const daysLeft = dosesPerDay > 0 ? Math.floor(dosesLeft / dosesPerDay) : 0;

          const isLow = daysLeft <= 3 && treatment.state === 'activo';
          const outOfStock = treatment.remainingQuantity < treatment.doseAmount;

          // For permanent treatments: never auto-mark as finished; show stock warning instead.
          // For temporal treatments: keep existing behaviour.
          const isFinished = treatment.isPermanent
            ? treatment.state === 'finalizado' || treatment.state === 'suspendido'
            : treatment.state === 'finalizado' || outOfStock;

          return (
            <div
              key={treatment.id}
              className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col"
            >
              {/* State badge */}
              {treatment.state === 'activo' && !isFinished ? (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  ACTIVO
                </div>
              ) : (
                <div className="absolute top-0 right-0 bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {treatment.state.toUpperCase()}
                </div>
              )}

              <div className="flex justify-between items-start mb-1 mt-2">
                <div className="flex items-center gap-2 mr-4 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-800">{treatment.name}</h2>
                  {/* Permanent badge */}
                  {treatment.isPermanent && (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <InfinityIcon className="w-3 h-3" /> Uso permanente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 -mr-2">
                  <EditTreatmentButton treatment={treatment} />
                  <form action={async () => {
                    'use server';
                    await deleteTreatment(treatment.id);
                  }}>
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
              <p className="text-teal-600 font-medium mb-4">{treatment.reason}</p>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex flex-col gap-1 text-gray-600">
                  <span className="flex items-center gap-1 font-medium"><Calendar className="w-4 h-4" /> Inicio</span>
                  <span>{treatment.startDate}</span>
                </div>
                <div className="flex flex-col gap-1 text-gray-600">
                  <span className="flex items-center gap-1 font-medium"><Clock className="w-4 h-4" /> Frecuencia</span>
                  <span>Cada {treatment.frequencyHours} hrs</span>
                </div>
              </div>

              {/* Stock bar */}
              <div className="mb-4 flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Stock restante</span>
                  <span className="text-sm font-bold text-gray-800">
                    {treatment.remainingQuantity} / {treatment.initialQuantity} {treatment.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${outOfStock ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-teal-500'}`}
                    style={{ width: `${Math.min(100, (treatment.remainingQuantity / (treatment.initialQuantity > 0 ? treatment.initialQuantity : 1)) * 100)}%` }}
                  />
                </div>

                {/* Doses / days stats */}
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div className="bg-gray-50 border p-2 rounded">
                    <p className="text-gray-500 text-xs">Dosis restantes</p>
                    <p className="font-bold text-gray-800">{dosesLeft}</p>
                  </div>
                  <div className="bg-gray-50 border p-2 rounded">
                    {treatment.isPermanent ? (
                      <>
                        <p className="text-gray-500 text-xs">Tratamiento</p>
                        <p className="font-bold text-purple-700 text-xs">Permanente</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 text-xs">Días restantes</p>
                        <p className="font-bold text-gray-800">{daysLeft}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Low stock alert — shown for both permanent and temporal */}
              {isLow && !outOfStock && treatment.state === 'activo' && (
                <div className="mb-4 flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg text-sm font-medium border border-orange-100">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  Stock bajo. Quedan dosis para {daysLeft} día{daysLeft !== 1 ? 's' : ''}.
                </div>
              )}

              {/* Out of stock alert (shown for permanent; temporal shows as finished) */}
              {outOfStock && treatment.state === 'activo' && (
                <div className="mb-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  Stock insuficiente. Actualiza el stock del medicamento.
                </div>
              )}

              {/* Dose button — hidden when finished/suspended; hidden when out of stock */}
              {!isFinished && !outOfStock && (
                <form
                  action={async () => {
                    'use server';
                    await markDoseAsGiven(treatment.id, treatment.name, treatment.doseAmount, treatment.unit);
                  }}
                  className="mt-auto pt-2 border-t border-gray-100"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Dosis: <strong>{treatment.doseAmount} {treatment.unit}</strong>
                    </div>
                    <button
                      type="submit"
                      className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors border border-teal-200"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Marcar Dosis
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}

        {treatments.length === 0 && (
          <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
            <Pill className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay tratamientos activos</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Registra los medicamentos que toma tu mascota para recibir recordatorios diarios y controlar el stock.
            </p>
            <div className="scale-110">
              <AddTreatmentButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
