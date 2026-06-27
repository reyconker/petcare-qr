'use client';

import { logout } from '@/app/actions';
import { LogOut, Menu, PawPrint } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/hoy': 'Hoy',
  '/dashboard': 'Dashboard',
  '/perfil': 'Perfil de Mascota',
  '/ficha': 'Ficha Médica',
  '/tratamientos': 'Tratamientos',
  '/historial-dosis': 'Historial de Dosis',
  '/alimento': 'Control de Alimento',
  '/recetas': 'Recetas',
  '/examenes': 'Exámenes',
  '/vacunas': 'Vacunas',
  '/centros-veterinarios': 'Centros Veterinarios',
  '/qr-config': 'Código QR',
  '/mascotas': 'Mis Mascotas',
};

export function TopNav({
  onMenuClick,
  dogName,
}: {
  onMenuClick?: () => void;
  dogName?: string;
}) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? 'PetCare QR';

  return (
    <header className="h-14 md:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile: page title */}
        <span className="md:hidden font-semibold text-gray-800 truncate">{pageTitle}</span>

        {/* Desktop: brand + page title */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-teal-700">
            <PawPrint className="w-5 h-5" />
            <span className="font-bold text-sm">PetCare QR</span>
          </div>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium text-sm">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {dogName && (
          <span className="hidden sm:block text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
            🐾 {dogName}
          </span>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm hidden sm:block">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
