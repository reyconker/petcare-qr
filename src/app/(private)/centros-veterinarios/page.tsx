import { createClient } from '@/lib/supabase/server';
import { MapPin, Phone, Trash2, User } from 'lucide-react';
import { deleteCenter } from '@/app/actions/veterinary-centers';
import { AddCenterButton, EditCenterButton } from './CenterForms';
import { VeterinaryCenter } from '@/types';

async function getCenters(): Promise<VeterinaryCenter[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('veterinary_centers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    name: c.name ?? '',
    address: c.address ?? '',
    phone: c.phone ?? '',
    vetName: c.vet_name ?? '',
    specialty: c.specialty ?? '',
    observations: c.observations ?? '',
    createdAt: c.created_at ?? '',
  }));
}

export default async function CentrosVeterinariosPage() {
  const centers = await getCenters();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-teal-600" /> Mis Centros Veterinarios
          </h1>
          <p className="text-gray-500 text-sm mt-1">Clínicas y veterinarios de referencia</p>
        </div>
        <AddCenterButton />
      </div>

      {centers.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-teal-200 rounded-xl p-12 text-center">
          <div className="bg-teal-50 p-5 rounded-full mb-4">
            <MapPin className="w-12 h-12 text-teal-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin centros registrados</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Guarda las clínicas y veterinarios de confianza para tener sus datos siempre a mano.
          </p>
          <AddCenterButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map((center) => (
            <div
              key={center.id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base leading-tight">{center.name}</h3>
                  {center.specialty && (
                    <span className="inline-block mt-1 text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-medium">
                      {center.specialty}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <EditCenterButton center={center} />
                  <form
                    action={async () => {
                      'use server';
                      await deleteCenter(center.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {center.phone && (
                  <a
                    href={`tel:${center.phone}`}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <div className="bg-teal-100 p-1.5 rounded-full flex-shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    {center.phone}
                  </a>
                )}

                {center.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="break-words">{center.address}</span>
                  </div>
                )}

                {center.vetName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span>{center.vetName}</span>
                  </div>
                )}

                {center.observations && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-gray-500 text-xs">{center.observations}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
