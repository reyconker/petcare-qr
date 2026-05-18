import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { setActiveDog, createDogProfile } from '@/app/actions/dogs';
import { Dog, Plus, CheckCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MascotasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dogs } = await supabase
    .from('dog_profiles')
    .select('id, name, breed, gender, weight, photo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const activeDogId = await getDogId();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Dog className="text-teal-600" /> Mis Mascotas
          </h1>
          <p className="text-gray-500 text-sm mt-1">Administra los perfiles de tus mascotas</p>
        </div>
      </div>

      {/* Existing pets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(dogs ?? []).map(dog => {
          const isActive = dog.id === activeDogId;
          return (
            <div
              key={dog.id}
              className={`bg-white rounded-2xl border-2 p-5 shadow-sm flex items-center gap-4 transition-all ${
                isActive ? 'border-teal-500 shadow-teal-100 shadow-md' : 'border-gray-200'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {dog.photo_url ? (
                  <img src={dog.photo_url} alt={dog.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">🐶</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-800 text-lg truncate">{dog.name}</h2>
                  {isActive && <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />}
                </div>
                <p className="text-gray-500 text-sm">{dog.breed} · {dog.gender} · {dog.weight}kg</p>
                {isActive ? (
                  <span className="inline-block mt-2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Activa</span>
                ) : (
                  <form action={setActiveDog.bind(null, dog.id)} className="mt-2">
                    <button
                      type="submit"
                      className="text-xs font-medium text-gray-600 hover:text-teal-600 bg-gray-100 hover:bg-teal-50 px-3 py-1 rounded-full transition-colors"
                    >
                      Cambiar a esta
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add new pet form */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
          <Plus className="w-5 h-5 text-teal-600" /> Añadir otra mascota
        </h2>
        <form action={createDogProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" name="name" required placeholder="Ej: Luna" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input type="text" name="breed" placeholder="Ej: Poodle" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select name="gender" className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input type="number" name="weight" step="0.1" min="0" placeholder="Ej: 8.0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color / Pelaje</label>
              <input type="text" name="color" placeholder="Ej: Blanco" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="birthDate" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input type="tel" name="ownerPhone" placeholder="+56 9 1234 5678" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre *</label>
              <input type="text" name="ownerName" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Registrar Mascota
          </button>
        </form>
      </div>
    </div>
  );
}
