'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

function calculateVaccineState(nextDate: string): 'al día' | 'próxima' | 'vencida' {
  if (!nextDate) return 'vencida';
  const today = new Date();
  const next = new Date(nextDate);
  const diff = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'vencida';
  if (diff <= 30) return 'próxima';
  return 'al día';
}

export async function addVaccine(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const name = (formData.get('name') as string)?.trim();
  const type = formData.get('type') as string;
  const nextDate = formData.get('nextDate') as string;

  if (!name) throw new Error('El nombre de la vacuna es obligatorio.');
  if (!['vacuna', 'desparasitación'].includes(type)) throw new Error('El tipo debe ser "vacuna" o "desparasitación".');
  if (!nextDate) throw new Error('La fecha próxima es obligatoria.');

  await supabase.from('vaccines').insert({
    dog_id: dogId,
    type,
    name,
    application_date: (formData.get('applicationDate') as string) || '',
    next_date: nextDate,
    veterinarian: (formData.get('veterinarian') as string) || '',
    notes: (formData.get('notes') as string) || '',
    state: calculateVaccineState(nextDate),
  });

  revalidatePath('/vacunas');
  revalidatePath('/hoy');
}

export async function editVaccine(id: string, formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const name = (formData.get('name') as string)?.trim();
  const type = formData.get('type') as string;
  const nextDate = formData.get('nextDate') as string;

  if (!name) throw new Error('El nombre de la vacuna es obligatorio.');
  if (!['vacuna', 'desparasitación'].includes(type)) throw new Error('El tipo debe ser "vacuna" o "desparasitación".');
  if (!nextDate) throw new Error('La fecha próxima es obligatoria.');

  await supabase.from('vaccines').update({
    type,
    name,
    application_date: (formData.get('applicationDate') as string) || '',
    next_date: nextDate,
    veterinarian: (formData.get('veterinarian') as string) || '',
    notes: (formData.get('notes') as string) || '',
    state: calculateVaccineState(nextDate),
  }).eq('id', id).eq('dog_id', dogId);

  revalidatePath('/vacunas');
  revalidatePath('/hoy');
}

export async function deleteVaccine(id: string) {
  const supabase = await createClient();
  const dogId = await getDogId();
  await supabase.from('vaccines').delete().eq('id', id).eq('dog_id', dogId);
  revalidatePath('/vacunas');
  revalidatePath('/hoy');
}
