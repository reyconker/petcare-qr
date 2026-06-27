'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCenter(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado.');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('El nombre de la clínica es obligatorio.');

  await supabase.from('veterinary_centers').insert({
    user_id: user.id,
    name,
    address: (formData.get('address') as string) || '',
    phone: (formData.get('phone') as string) || '',
    vet_name: (formData.get('vetName') as string) || '',
    specialty: (formData.get('specialty') as string) || '',
    observations: (formData.get('observations') as string) || '',
  });

  revalidatePath('/centros-veterinarios');
}

export async function editCenter(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado.');

  const name = (formData.get('name') as string)?.trim();
  if (!name) throw new Error('El nombre de la clínica es obligatorio.');

  await supabase.from('veterinary_centers').update({
    name,
    address: (formData.get('address') as string) || '',
    phone: (formData.get('phone') as string) || '',
    vet_name: (formData.get('vetName') as string) || '',
    specialty: (formData.get('specialty') as string) || '',
    observations: (formData.get('observations') as string) || '',
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id);

  revalidatePath('/centros-veterinarios');
}

export async function deleteCenter(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No estás autenticado.');

  await supabase.from('veterinary_centers').delete().eq('id', id).eq('user_id', user.id);
  revalidatePath('/centros-veterinarios');
}
