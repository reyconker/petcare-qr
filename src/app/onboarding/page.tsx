import { createDogProfile } from '@/app/actions/dogs';
import { PawPrint } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-teal-500 p-4 rounded-full mb-4">
            <PawPrint className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 text-center">¡Bienvenido a PetCare QR!</h1>
          <p className="text-gray-500 text-sm mt-2 text-center">Cuéntanos sobre tu mascota para comenzar.</p>
        </div>

        <form action={createDogProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del perro *</label>
              <input type="text" name="name" required placeholder="Ej: Max" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input type="text" name="breed" placeholder="Ej: Labrador" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select name="gender" className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input type="date" name="birthDate" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input type="number" name="weight" step="0.1" min="0" placeholder="Ej: 12.5" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color / Pelaje</label>
              <input type="text" name="color" placeholder="Ej: Dorado" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre (dueño) *</label>
              <input type="text" name="ownerName" required placeholder="Ej: Juan García" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
              <input type="tel" name="ownerPhone" placeholder="+56 9 1234 5678" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors mt-4"
          >
            Registrar mi Mascota →
          </button>
        </form>
      </div>
    </div>
  );
}
