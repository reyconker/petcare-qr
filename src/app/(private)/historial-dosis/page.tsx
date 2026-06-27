import { getDbData } from '@/lib/db';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function HistorialDosisPage() {
  const data = await getDbData();
  const history = [...data.doseHistory].reverse();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <History className="text-teal-600" /> Historial de Dosis
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {history.length} registro{history.length !== 1 ? 's' : ''} · medicamentos administrados
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <div className="bg-gray-50 p-5 rounded-full mb-4">
            <History className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Historial vacío</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            No hay dosis registradas aún. Marca las dosis desde la página de Tratamientos.
          </p>
          <Link
            href="/tratamientos"
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Ir a Tratamientos →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((dose) => {
            const dateObj = new Date(dose.givenAt);
            const date = dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
            const time = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
            const isDada = dose.status === 'dada';

            return (
              <div
                key={dose.id}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-4"
              >
                <div className={`p-2 rounded-xl flex-shrink-0 ${isDada ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {isDada
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : <XCircle className="w-5 h-5 text-gray-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{dose.medicineName}</p>
                  <p className="text-teal-600 text-xs">{dose.doseAmount} {dose.unit}</p>
                  {dose.notes && <p className="text-gray-400 text-xs mt-0.5 truncate">{dose.notes}</p>}
                </div>

                <div className="text-right flex-shrink-0 text-sm">
                  <p className="text-gray-700 font-medium">{date}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {time}
                  </p>
                </div>

                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold capitalize flex-shrink-0 ${isDada ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {dose.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
