import { FileText } from 'lucide-react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-gray-900">Términos de Servicio</h1>
        </div>
        
        <div className="prose prose-teal max-w-none text-gray-600">
          <p className="text-sm text-gray-500 mb-6">Última actualización: Mayo 2026</p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1. Uso de la Aplicación</h2>
          <p>
            PetCare QR es una herramienta diseñada para ayudarte a organizar la información médica de tus mascotas, llevar un registro de dosis y compartir una ficha de emergencia mediante un código QR.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2. No reemplaza la atención veterinaria</h2>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg my-4 text-orange-800">
            <strong>AVISO IMPORTANTE:</strong> PetCare QR NO es un dispositivo médico ni un software de diagnóstico. 
            La aplicación no reemplaza de ninguna manera la consulta, diagnóstico o tratamiento de un médico veterinario profesional.
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3. Responsabilidad del Usuario</h2>
          <p>
            Es responsabilidad exclusiva del usuario:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Ingresar correctamente las dosis y frecuencias indicadas por su veterinario.</li>
            <li>Verificar físicamente los medicamentos antes de administrarlos.</li>
            <li>Acudir a un centro veterinario en caso de emergencia.</li>
            <li>No depender exclusivamente de la aplicación para decisiones críticas de salud.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4. Disponibilidad del Servicio</h2>
          <p>
            Hacemos nuestro mejor esfuerzo para que la aplicación y el acceso por QR estén siempre disponibles, 
            pero no podemos garantizar un 100% de tiempo de actividad (uptime) debido a mantenimientos o fallas imprevistas.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
          <Link href="/login" className="text-teal-600 font-medium hover:underline">
            ← Volver a inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
