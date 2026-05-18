'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

export async function updateFoodQuantity(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  const quantity = Number(formData.get('quantity'));
  if (isNaN(quantity) || quantity < 0) throw new Error('La cantidad debe ser un número mayor o igual a 0.');

  const { data: food } = await supabase.from('food_control').select('total_quantity_kg').eq('dog_id', dogId).single();
  const totalKg = food ? Math.max(food.total_quantity_kg, quantity) : quantity;

  await supabase.from('food_control').upsert({
    dog_id: dogId,
    remaining_quantity_kg: quantity,
    total_quantity_kg: totalKg,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dog_id' });

  revalidatePath('/alimento');
  revalidatePath('/hoy');
}

export async function registerFoodPurchase(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  const quantity = Number(formData.get('quantity'));
  if (isNaN(quantity) || quantity <= 0) throw new Error('La cantidad del saco debe ser mayor a 0.');

  const brand = (formData.get('brand') as string) || '';
  const foodType = (formData.get('foodType') as string) || '';

  await supabase.from('food_control').upsert({
    dog_id: dogId,
    brand: brand || undefined,
    food_type: foodType || undefined,
    total_quantity_kg: quantity,
    remaining_quantity_kg: quantity,
    purchase_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dog_id' });

  revalidatePath('/alimento');
  revalidatePath('/hoy');
}

export async function updateFoodSettings(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const dailyRationGrams = Number(formData.get('dailyRationGrams'));
  const timesPerDay = Number(formData.get('timesPerDay'));
  const alertThresholdDays = Number(formData.get('alertThresholdDays'));

  if (isNaN(dailyRationGrams) || dailyRationGrams <= 0) throw new Error('La ración diaria debe ser mayor a 0.');
  if (isNaN(timesPerDay) || timesPerDay <= 0) throw new Error('Las veces al día deben ser mayor a 0.');
  if (isNaN(alertThresholdDays) || alertThresholdDays <= 0) throw new Error('El umbral de alerta debe ser mayor a 0.');

  await supabase.from('food_control').upsert({
    dog_id: dogId,
    daily_ration_grams: dailyRationGrams,
    times_per_day: timesPerDay,
    alert_threshold_days: alertThresholdDays,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dog_id' });

  revalidatePath('/alimento');
  revalidatePath('/hoy');
}
