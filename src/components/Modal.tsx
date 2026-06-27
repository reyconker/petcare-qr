'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Allow closing with Escape key (native) or backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (!rect) return;
    const isOutside =
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom;
    if (isOutside) onClose();
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={[
        'backdrop:bg-black/50 p-0 rounded-2xl shadow-2xl',
        // Mobile: full width with small horizontal margin, sheet from bottom feel
        'w-[calc(100%-1.5rem)] mx-auto',
        // Max width on larger screens
        'max-w-lg md:max-w-2xl',
        'bg-white',
        // Height: grow to content but cap at 92vh, scroll inside
        'max-h-[92svh] md:max-h-[85vh]',
        'overflow-hidden flex flex-col',
        // Center vertically
        'my-auto',
      ].join(' ')}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {/* Sticky header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 sticky top-0">
        <h2 className="text-lg font-bold text-gray-800 leading-tight pr-2">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="px-5 py-5 overflow-y-auto flex-1 overscroll-contain">
        {children}
      </div>
    </dialog>
  );
}
