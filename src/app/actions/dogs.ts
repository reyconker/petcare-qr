'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadImage } from '@/app/actions/upload';

export async function getActiveDogId(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return cookieStore.get('active_dog_id')?.value ?? null;
}

export async function setActiveDog(dogId: string) {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('active_dog_id', dogId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function getUserDogs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('dog_profiles')
    .select('id, name, breed, photo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return data ?? [];
}

export async function createDogProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: dog, error } = await supabase
    .from('dog_profiles')
    .insert({
      user_id: user.id,
      name: formData.get('name') as string,
      breed: formData.get('breed') as string,
      gender: formData.get('gender') as string,
      birth_date: formData.get('birthDate') as string,
      weight: Number(formData.get('weight')) || 0,
      color: formData.get('color') as string,
      owner_name: formData.get('ownerName') as string,
      owner_phone: formData.get('ownerPhone') as string,
      owner_email: user.email,
    })
    .select('id')
    .single();

  console.log('[DEBUG onboarding] Insert result:', { dogId: dog?.id, error: error?.message });

  if (error || !dog) {
    console.error('[DEBUG onboarding] Insert failed. Not redirecting.', error);
    return; // Do not redirect if it fails
  }

  // Create default food_control for the new dog
  await supabase.from('food_control').insert({
    dog_id: dog.id,
    brand: 'Sin registrar',
    food_type: 'Seco',
    total_quantity_kg: 0,
    remaining_quantity_kg: 0,
    daily_ration_grams: 200,
    times_per_day: 2,
    alert_threshold_days: 7,
  });

  // Set new dog as active
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('active_dog_id', dog.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  console.log('[DEBUG onboarding] Cookie active_dog_id set to:', dog.id);

  revalidatePath('/', 'layout');
  console.log('[DEBUG onboarding] Redirecting to /dashboard');
  redirect('/dashboard');
}

export async function editDogProfile(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  // Parse array fields from comma-separated strings
  const allergiesRaw = (formData.get('allergies') as string) || '';
  const diseasesRaw = (formData.get('diseases') as string) || '';
  const allergies = allergiesRaw.split(',').map(s => s.trim()).filter(Boolean);
  const diseases = diseasesRaw.split(',').map(s => s.trim()).filter(Boolean);

  const weight = Number(formData.get('weight'));

  const photoFile = formData.get('photoFile') as File | null;
  let photo_url = (formData.get('photoUrl') as string)?.trim() || undefined;

  if (photoFile && photoFile.size > 0) {
    photo_url = await uploadImage(photoFile, photo_url || '');
  }

  await supabase.from('dog_profiles').update({
    name: (formData.get('name') as string)?.trim() || undefined,
    photo_url: photo_url,
    breed: (formData.get('breed') as string)?.trim() || '',
    gender: (formData.get('gender') as string) || undefined,
    birth_date: (formData.get('birthDate') as string) || undefined,
    age_text: (formData.get('ageText') as string)?.trim() || '',
    weight: isNaN(weight) ? 0 : weight,
    color: (formData.get('color') as string)?.trim() || '',
    microchip: (formData.get('microchip') as string)?.trim() || undefined,
    allergies,
    diseases,
    emergency_notes: (formData.get('emergencyNotes') as string)?.trim() || '',
    owner_name: (formData.get('ownerName') as string)?.trim() || '',
    owner_phone: (formData.get('ownerPhone') as string)?.trim() || '',
    updated_at: new Date().toISOString(),
  }).eq('id', dogId);

  revalidatePath('/perfil');
  revalidatePath('/', 'layout');
}
