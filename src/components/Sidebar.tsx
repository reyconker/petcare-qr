'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Dog, FileText, Pill, Bone,
  Syringe, QrCode, CalendarClock, History,
  Image as ImageIcon, ChevronRight, PawPrint,
  FlaskConical, MapPin,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Hoy', href: '/hoy', icon: CalendarClock },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Perfil de Mascota', href: '/perfil', icon: Dog },
  { name: 'Ficha Médica', href: '/ficha', icon: FileText },
  { name: 'Tratamientos', href: '/tratamientos', icon: Pill },
  { name: 'Historial Dosis', href: '/historial-dosis', icon: History },
  { name: 'Alimento', href: '/alimento', icon: Bone },
  { name: 'Recetas', href: '/recetas', icon: ImageIcon },
  { name: 'Exámenes', href: '/examenes', icon: FlaskConical },
  { name: 'Vacunas', href: '/vacunas', icon: Syringe },
  { name: 'Centros Veterinarios', href: '/centros-veterinarios', icon: MapPin },
  { name: 'Código QR', href: '/qr-config', icon: QrCode },
];

interface SidebarProps {
  isOpen?: boolean;
  closeMenu?: () => void;
  activeDogName?: string;
  activeDogPhotoUrl?: string | null;
  dogsCount?: number;
}

export function Sidebar({
  isOpen = false,
  closeMenu = () => {},
  activeDogName = 'Mi Mascota',
  activeDogPhotoUrl,
  dogsCount = 1,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={clsx(
      "fixed inset-y-0 left-0 z-30 w-64 bg-teal-800 text-white flex flex-col transition-transform duration-300 md:static md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo */}
      <div className="p-5 border-b border-teal-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PawPrint className="w-6 h-6" />
          PetCare QR
        </h1>
      </div>

      {/* Active pet chip */}
      <Link
        href="/mascotas"
        onClick={() => closeMenu()}
        className="mx-4 mt-4 flex items-center gap-3 bg-teal-700 hover:bg-teal-600 rounded-xl px-3 py-2.5 transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0">
          {activeDogPhotoUrl ? (
            <img src={activeDogPhotoUrl} alt={activeDogName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg">🐶</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{activeDogName}</p>
          <p className="text-teal-300 text-xs">
            {dogsCount > 1 ? `${dogsCount} mascotas · cambiar` : 'Ver perfil'}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-teal-300 group-hover:text-white transition-colors flex-shrink-0" />
      </Link>

      <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => closeMenu()}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-teal-700 text-white' : 'text-teal-100 hover:bg-teal-700 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name === 'Perfil de Mascota' ? `Perfil de ${activeDogName}` : item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
