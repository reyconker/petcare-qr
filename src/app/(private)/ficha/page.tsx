import { getDbData } from '@/lib/db';
import { Stethoscope, Activity, FileText } from 'lucide-react';

export default async function FichaMedicaPage() {
  const data = await getDbData();
  const sortedPrescriptions = [...data.prescriptions].reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-teal-600" /> Ficha Médica
          </h1>
          <p className="text-gray-500 text-sm mt-1">Historial médico y atenciones de {data.dog.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Stethoscope className="text-indigo-500 w-5 h-5" /> Atenciones y Órdenes
        </h2>

        {sortedPrescriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay registros de atenciones médicas.</p>
        ) : (
          <div className="space-y-6">
            {sortedPrescriptions.map((prescription) => (
              <div key={prescription.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{prescription.diagnosis}</h3>
                    <p className="text-sm text-gray-500">{prescription.date} • {prescription.clinic} • {prescription.veterinarian}</p>
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
                    Consulta
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 flex items-center gap-1 mb-1">
                      <FileText className="w-4 h-4" /> Medicamentos Indicados
                    </h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{prescription.medications}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Instrucciones</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{prescription.instructions}</p>
                  </div>
                </div>

                {prescription.nextControl && (
                  <div className="mt-4 pt-4 border-t text-sm">
                    <span className="font-semibold text-gray-700">Próximo control sugerido: </span>
                    <span className="text-gray-600">{prescription.nextControl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
