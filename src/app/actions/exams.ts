'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';
import { validateRecipeFile } from '@/lib/recipeValidation';

const EXAM_BUCKET = 'exams';

async function uploadExamFile(file: File, userId: string, dogId: string): Promise<string> {
  if (!file || file.size === 0) return '';

  const validationError = validateRecipeFile(file);
  if (validationError) throw new Error(validationError);

  const supabase = await createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/${dogId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(EXAM_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error(
        'El bucket "exams" no existe en Supabase Storage. ' +
        'Créalo en Supabase → Storage → New Bucket → nombre: exams → Private.'
      );
    }
    throw new Error('Error al subir el archivo. Verifica formato y tamaño.');
  }

  return path;
}

export async function addExam(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado.');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('El nombre del examen es obligatorio.');

  const examDate = formData.get('examDate') as string;
  if (!examDate) throw new Error('La fecha del examen es obligatoria.');

  const file = formData.get('examFile') as File | null;
  let fileUrl = '';
  if (file && file.size > 0) {
    fileUrl = await uploadExamFile(file, user.id, dogId);
  }

  await supabase.from('exams').insert({
    dog_id: dogId,
    name,
    exam_date: examDate,
    reason: (formData.get('reason') as string) || 'otro',
    clinic: (formData.get('clinic') as string) || '',
    file_url: fileUrl,
    observations: (formData.get('observations') as string) || '',
  });

  revalidatePath('/examenes');
}

export async function editExam(id: string, formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado.');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('El nombre del examen es obligatorio.');

  const examDate = formData.get('examDate') as string;
  if (!examDate) throw new Error('La fecha del examen es obligatoria.');

  // Check if new file uploaded
  const file = formData.get('examFile') as File | null;
  let fileUrl = (formData.get('existingFileUrl') as string) || '';
  if (file && file.size > 0) {
    fileUrl = await uploadExamFile(file, user.id, dogId);
  }

  await supabase.from('exams').update({
    name,
    exam_date: examDate,
    reason: (formData.get('reason') as string) || 'otro',
    clinic: (formData.get('clinic') as string) || '',
    file_url: fileUrl,
    observations: (formData.get('observations') as string) || '',
  }).eq('id', id).eq('dog_id', dogId);

  revalidatePath('/examenes');
}

export async function deleteExam(id: string) {
  const supabase = await createClient();
  const dogId = await getDogId();
  await supabase.from('exams').delete().eq('id', id).eq('dog_id', dogId);
  revalidatePath('/examenes');
}

export async function getExamSignedUrl(path: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from(EXAM_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? '';
}
