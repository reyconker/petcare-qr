'use client';



export function RegenerateTokenButton() {
  return (
    <button
      type="submit"
      className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 rounded-lg transition-colors text-xs border border-red-200"
      onClick={(e) => {
        if (!confirm('¿Estás seguro de regenerar el token? El QR anterior quedará invalidado y nadie podrá acceder a la ficha usando el enlace viejo.')) {
          e.preventDefault();
        }
      }}
    >
      Regenerar Token
    </button>
  );
}
