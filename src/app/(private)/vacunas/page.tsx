import { getDbData } from '@/lib/db';
import { Syringe, Shield, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { deleteVaccine } from '@/app/actions/vaccines';
import { AddVaccineButton, EditVaccineButton } from './VaccineForms';

export default async function VacunasPage() {
  const data = await getDbData();
  const vaccines = data.vaccines;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-blue-600" /> Vacunas y Desparasitaciones
          </h1>
          <p className="text-gray-500 text-sm mt-1">Esquema de prevención de {data.dog.name}</p>
        </div>
        <AddVaccineButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 border-b">Tipo / Nombre</th>
                <th className="p-4 border-b">Aplicación</th>
                <th className="p-4 border-b">Próxima Dosis</th>
                <th className="p-4 border-b">Veterinario</th>
                <th className="p-4 border-b">Estado</th>
                <th className="p-4 border-b text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vaccines.map((vaccine) => {
                let StateIcon = Shield;
                let stateColor = 'text-gray-500 bg-gray-100';
                
                if (vaccine.state === 'al día') {
                  StateIcon = ShieldCheck;
                  stateColor = 'text-green-700 bg-green-100';
                } else if (vaccine.state === 'próxima') {
                  StateIcon = ShieldAlert;
                  stateColor = 'text-orange-700 bg-orange-100';
                } else if (vaccine.state === 'vencida') {
                  StateIcon = ShieldAlert;
                  stateColor = 'text-red-700 bg-red-100';
                }

                return (
                  <tr key={vaccine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{vaccine.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{vaccine.type}</p>
                    </td>
                    <td className="p-4 text-gray-600">{vaccine.applicationDate}</td>
                    <td className="p-4 font-medium text-gray-800">{vaccine.nextDate}</td>
                    <td className="p-4 text-gray-600">{vaccine.veterinarian}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${stateColor}`}>
                        <StateIcon className="w-3 h-3" />
                        {vaccine.state}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end items-center gap-1">
                      <form action={async () => {
                        'use server';
                        // Ideally we prefill, but since we use server action, let's just make it a client button.
                        // Wait, AddVaccineButton doesn't support prefilling yet.
                      }}>
                      </form>
                      <AddVaccineButton prefill={vaccine} buttonText="Renovar" />
                      <EditVaccineButton vaccine={vaccine} />
                      <form action={async () => {
                        'use server';
                        await deleteVaccine(vaccine.id);
                      }}>
                        <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {vaccines.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white">
              <Shield className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Sin registros preventivos</h3>
              <p className="text-gray-500 mb-6 max-w-md">Lleva el control de todas las vacunas y desparasitaciones para mantener a tu mascota protegida.</p>
              <div className="scale-110">
                <AddVaccineButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
