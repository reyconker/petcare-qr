'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog 
      ref={dialogRef}
      className="backdrop:bg-black/50 p-0 rounded-2xl shadow-xl w-[calc(100%-2rem)] max-w-lg md:max-w-2xl bg-white m-auto max-h-[90vh] overflow-hidden flex flex-col"
      onClose={onClose}
    >
      <div className="p-4 md:p-6 border-b flex items-center justify-between bg-white flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 md:p-6 overflow-y-auto">
        {children}
      </div>
    </dialog>
  );
}
