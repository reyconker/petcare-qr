'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

export async function addVisit(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const date = formData.get('date') as string;
  const visitType = formData.get('visitType') as string;

  if (!date) throw new Error('La fecha es obligatoria.');
  if (!visitType) throw new Error('El tipo de consulta es obligatorio.');

  await supabase.from('veterinary_visits').insert({
    dog_id: dogId,
    date,
    clinic: (formData.get('clinic') as string) || '',
    clinic_phone: (formData.get('clinicPhone') as string) || '',
    visit_type: visitType,
    specialty_name: (formData.get('specialtyName') as string) || '',
    vet_name: (formData.get('vetName') as string) || '',
    tasks: (formData.get('tasks') as string) || '',
    observations: (formData.get('observations') as string) || '',
    next_control: (formData.get('nextControl') as string) || null,
  });

  revalidatePath('/ficha');
}

export async function editVisit(id: string, formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const date = formData.get('date') as string;
  const visitType = formData.get('visitType') as string;

  if (!date) throw new Error('La fecha es obligatoria.');
  if (!visitType) throw new Error('El tipo de consulta es obligatorio.');

  await supabase.from('veterinary_visits').update({
    date,
    clinic: (formData.get('clinic') as string) || '',
    clinic_phone: (formData.get('clinicPhone') as string) || '',
    visit_type: visitType,
    specialty_name: (formData.get('specialtyName') as string) || '',
    vet_name: (formData.get('vetName') as string) || '',
    tasks: (formData.get('tasks') as string) || '',
    observations: (formData.get('observations') as string) || '',
    next_control: (formData.get('nextControl') as string) || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('dog_id', dogId);

  revalidatePath('/ficha');
}

export async function deleteVisit(id: string) {
  const supabase = await createClient();
  const dogId = await getDogId();

  await supabase.from('veterinary_visits').delete().eq('id', id).eq('dog_id', dogId);
  revalidatePath('/ficha');
}
