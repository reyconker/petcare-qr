'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { validateRecipeFile } from '@/lib/recipeValidation';

/**
 * Uploads a recipe/prescription file to the "prescriptions" bucket.
 * Returns the stored path (for signed URL generation later).
 * Throws a user-friendly error if validation fails or upload fails.
 */
export async function uploadRecipeFile(file: File, fallbackPath = ''): Promise<string> {
  if (!file || file.size === 0) return fallbackPath;

  const validationError = validateRecipeFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado. Inicia sesión nuevamente.');

  const dogId = await getDogId();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${user.id}/${dogId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('prescriptions')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    // Bucket doesn't exist → clear message
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        'El bucket "prescriptions" no existe en Supabase Storage. ' +
        'Créalo manualmente en Supabase → Storage → New Bucket → nombre: prescriptions → Private.'
      );
    }
    throw new Error('Error al subir el archivo. Verifica el formato y el tamaño.');
  }

  // Return relative path — db.ts will generate signed URL on read
  return path;
}

/**
 * Legacy: uploads an image to a public or private bucket.
 * Used by pet photo uploads. Not used for recipes anymore.
 */
export async function uploadImage(
  file: File,
  fallbackUrl = '',
  bucket: 'petcare-public' | 'petcare-private' = 'petcare-public'
): Promise<string> {
  if (!file || file.size === 0) return fallbackUrl;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const dogId = await getDogId();
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${user.id}/${dogId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Upload error:', error.message);
      return fallbackUrl;
    }

    if (bucket === 'petcare-private') {
      return path;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('Upload failed:', e);
    return fallbackUrl;
  }
}
