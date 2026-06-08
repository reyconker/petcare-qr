/**
 * Client-safe file validation utilities for recipe/prescription uploads.
 * No server-side code — safe to import from both client and server components.
 */

export const ALLOWED_RECIPE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB
export const MAX_PDF_BYTES = 10 * 1024 * 1024;   // 10 MB

/**
 * Returns a user-friendly error string if the file is invalid, or null if OK.
 */
export function validateRecipeFile(file: File): string | null {
  if (!ALLOWED_RECIPE_TYPES.includes(file.type)) {
    return 'Formato no permitido. Solo se aceptan JPG, PNG, WEBP o PDF.';
  }
  if (file.type === 'application/pdf' && file.size > MAX_PDF_BYTES) {
    return 'El PDF supera el límite de 10 MB. Por favor reduce el tamaño.';
  }
  if (file.type !== 'application/pdf' && file.size > MAX_IMAGE_BYTES) {
    return 'La imagen supera el límite de 5 MB. Por favor reduce el tamaño.';
  }
  return null;
}
