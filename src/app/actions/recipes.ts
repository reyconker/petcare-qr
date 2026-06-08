'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';
import { uploadRecipeFile } from '@/app/actions/upload';

export async function addRecipe(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const title = (formData.get('title') as string)?.trim();
  const date = formData.get('date') as string;
  const instructions = (formData.get('instructions') as string)?.trim();

  if (!title) throw new Error('El título de la receta es obligatorio.');
  if (!date) throw new Error('La fecha de la receta es obligatoria.');
  if (!instructions) throw new Error('Las indicaciones son obligatorias.');

  // File upload is optional — if no file, image_url is stored as ''
  const imageFile = formData.get('imageFile') as File | null;
  let imageUrl = '';

  if (imageFile && imageFile.size > 0) {
    // uploadRecipeFile throws a user-friendly error on validation/upload failure
    imageUrl = await uploadRecipeFile(imageFile, '');
  }

  const relatedTreatmentId = (formData.get('relatedTreatmentId') as string) || null;

  const { error } = await supabase.from('recipes').insert({
    dog_id: dogId,
    title,
    date,
    vet_name: (formData.get('vetName') as string) || '',
    clinic: (formData.get('clinic') as string) || '',
    diagnosis: (formData.get('diagnosis') as string) || '',
    instructions,
    image_url: imageUrl,
    related_treatment_id: relatedTreatmentId || null,
    notes: '',
  });

  if (error) {
    throw new Error('No se pudo guardar la receta. Inténtalo nuevamente.');
  }

  revalidatePath('/recetas');
}

export async function editRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const title = (formData.get('title') as string)?.trim();
  const date = formData.get('date') as string;
  const instructions = (formData.get('instructions') as string)?.trim();

  if (!title) throw new Error('El título de la receta es obligatorio.');
  if (!date) throw new Error('La fecha de la receta es obligatoria.');
  if (!instructions) throw new Error('Las indicaciones son obligatorias.');

  const imageFile = formData.get('imageFile') as File | null;
  const existingImageUrl = (formData.get('imageUrl') as string) || '';
  let imageUrl: string | undefined = undefined;

  if (imageFile && imageFile.size > 0) {
    // Upload new file — replaces the existing one
    imageUrl = await uploadRecipeFile(imageFile, existingImageUrl);
  }
  // If no new file selected, imageUrl stays undefined → we don't overwrite the existing one

  const relatedTreatmentId = (formData.get('relatedTreatmentId') as string) || null;

  const { error } = await supabase.from('recipes').update({
    title,
    date,
    vet_name: (formData.get('vetName') as string) || '',
    clinic: (formData.get('clinic') as string) || '',
    diagnosis: (formData.get('diagnosis') as string) || '',
    instructions,
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
    related_treatment_id: relatedTreatmentId || null,
  }).eq('id', id).eq('dog_id', dogId);

  if (error) {
    throw new Error('No se pudo actualizar la receta. Inténtalo nuevamente.');
  }

  revalidatePath('/recetas');
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const dogId = await getDogId();
  await supabase.from('recipes').delete().eq('id', id).eq('dog_id', dogId);
  revalidatePath('/recetas');
}
