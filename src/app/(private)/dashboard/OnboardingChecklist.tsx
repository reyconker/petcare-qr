'use client';

import { useState } from 'react';
import { CheckCircle, Circle, X } from 'lucide-react';
import Link from 'next/link';

interface ChecklistProps {
  hasFood: boolean;
  hasVaccines: boolean;
  hasTreatments: boolean;
  qrEnabled: boolean;
}

export function OnboardingChecklist({ hasFood, hasVaccines, hasTreatments, qrEnabled }: ChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  const completedCount = [hasFood, hasVaccines, hasTreatments, qrEnabled].filter(Boolean).length;
  
  if (dismissed || completedCount === 4) return null;

  return (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-md p-6 text-white relative mb-6">
      <button 
        onClick={() => setDismissed(true)} 
        className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <h2 className="text-xl font-bold mb-2">Configura PetCare QR</h2>
      <p className="text-teal-50 text-sm mb-4">Completa estos pasos básicos para aprovechar al máximo la ficha de tu mascota.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/alimento" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors cursor-pointer">
          {hasFood ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Circle className="w-5 h-5 text-white/50" />}
          <span className="font-medium text-sm">Registrar Alimento</span>
        </Link>
        <Link href="/vacunas" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors cursor-pointer">
          {hasVaccines ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Circle className="w-5 h-5 text-white/50" />}
          <span className="font-medium text-sm">Agregar Vacunas</span>
        </Link>
        <Link href="/tratamientos" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors cursor-pointer">
          {hasTreatments ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Circle className="w-5 h-5 text-white/50" />}
          <span className="font-medium text-sm">Añadir Tratamientos</span>
        </Link>
        <Link href="/qr-config" className="flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-colors cursor-pointer">
          {qrEnabled ? <CheckCircle className="w-5 h-5 text-green-300" /> : <Circle className="w-5 h-5 text-white/50" />}
          <span className="font-medium text-sm">Revisar QR Público</span>
        </Link>
      </div>
    </div>
  );
}
