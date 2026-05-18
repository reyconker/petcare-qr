import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
        </div>
        
        <div className="prose prose-teal max-w-none text-gray-600">
          <p className="text-sm text-gray-500 mb-6">Última actualización: Mayo 2026</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Qué datos se guardan</h2>
          <p>
            PetCare QR guarda únicamente la información que tú proporcionas sobre tus mascotas (nombre, raza, peso, enfermedades, etc.) 
            y los datos básicos de tu cuenta (correo electrónico y nombre).
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. Para qué se usan tus datos</h2>
          <p>
            Los datos se utilizan exclusivamente para permitir el funcionamiento de la aplicación: generar la ficha médica de tu mascota, 
            controlar su stock de medicamentos, recordar vacunas y permitir que accedas a esta información rápidamente.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Qué datos muestra el QR Público</h2>
          <p>
            Tú tienes el control total. Desde la sección &quot;Código QR&quot;, puedes elegir exactamente qué datos 
            (alergias, tratamientos, enfermedades crónicas, vacunas y tu número de contacto de emergencia) 
            serán visibles cuando alguien escanee el código QR de tu mascota.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Desactivación del QR</h2>
          <p>
            Puedes desactivar temporal o permanentemente el acceso público al código QR en cualquier momento. 
            También puedes &quot;Regenerar el Token&quot; si sospechas que el código anterior ha sido comprometido, 
            lo que invalidará cualquier QR impreso previamente.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5. Venta de datos</h2>
          <p className="font-medium text-teal-700">
            PetCare QR NO vende, alquila ni comercializa tus datos personales ni los de tu mascota a terceros bajo ninguna circunstancia.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link href="/login" className="text-teal-600 font-medium hover:underline">
            ← Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
