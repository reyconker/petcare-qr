import { getDbData } from '@/lib/db';
import { History } from 'lucide-react';

export default async function HistorialDosisPage() {
  const data = await getDbData();
  const history = [...data.doseHistory].reverse(); // newest first

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <History className="text-teal-600" /> Historial de Dosis
          </h1>
          <p className="text-gray-500 text-sm mt-1">Registro de todos los medicamentos administrados.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b">Medicamento</th>
                <th className="p-4 border-b">Dosis</th>
                <th className="p-4 border-b">Fecha y Hora</th>
                <th className="p-4 border-b">Estado</th>
                <th className="p-4 border-b">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((dose) => {
                const dateObj = new Date(dose.givenAt);
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={dose.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{dose.medicineName}</td>
                    <td className="p-4 text-gray-600">{dose.doseAmount} {dose.unit}</td>
                    <td className="p-4 text-gray-600">
                      <div>{date}</div>
                      <div className="text-xs text-gray-400">{time}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                        {dose.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{dose.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
              <History className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Historial vacío</h3>
              <p className="text-gray-500 mb-6 max-w-md">No has marcado ninguna dosis de medicamento aún. Ve a Tratamientos para comenzar.</p>
              <a href="/tratamientos" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
                Ir a Tratamientos
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
