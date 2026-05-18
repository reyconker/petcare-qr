'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDogProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { error } = await supabase.from('dog_profiles').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    breed: formData.get('breed') as string,
    gender: formData.get('gender') as string,
    birth_date: formData.get('birthDate') as string,
    weight: Number(formData.get('weight')),
    color: formData.get('color') as string,
    owner_name: formData.get('ownerName') as string,
    owner_phone: formData.get('ownerPhone') as string,
    owner_email: user.email,
  });

  if (error) throw new Error(error.message);

  // Create default food_control row
  const { data: dog } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (dog) {
    await supabase.from('food_control').insert({
      dog_id: dog.id,
      brand: 'Royal Canin',
      food_type: 'Seco',
      total_quantity_kg: 0,
      remaining_quantity_kg: 0,
      daily_ration_grams: 200,
      times_per_day: 2,
      alert_threshold_days: 7,
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
