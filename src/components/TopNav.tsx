'use client';

import { logout } from '@/app/actions';
import { LogOut, Menu } from 'lucide-react';

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">Panel de Control</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <form action={logout}>
          <button 
            type="submit"
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Salir</span>
          </button>
        </form>
      </div>
    </header>
  );
}
