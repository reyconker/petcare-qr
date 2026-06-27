'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

// ── Acción unificada: guarda/actualiza todos los campos del alimento ──────────
export async function saveFoodRecord(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();

  const totalRaw = Number(formData.get('totalQuantityKg'));
  const remainingRaw = Number(formData.get('remainingQuantityKg'));
  const dailyRationGrams = Number(formData.get('dailyRationGrams'));
  const timesPerDay = Number(formData.get('timesPerDay'));
  const alertThresholdDays = Number(formData.get('alertThresholdDays'));
  const reminderMinutes = Number(formData.get('reminderMinutes') ?? 15);

  // Validaciones
  if (isNaN(totalRaw) || totalRaw < 0) throw new Error('La cantidad total debe ser mayor o igual a 0.');
  if (isNaN(remainingRaw) || remainingRaw < 0) throw new Error('La cantidad restante debe ser mayor o igual a 0.');
  if (remainingRaw > totalRaw) throw new Error('La cantidad restante no puede superar la cantidad total.');
  if (isNaN(dailyRationGrams) || dailyRationGrams <= 0) throw new Error('La ración diaria debe ser mayor a 0.');
  if (isNaN(timesPerDay) || timesPerDay <= 0) throw new Error('Las comidas por día deben ser mayor a 0.');
  if (isNaN(reminderMinutes) || reminderMinutes < 0) throw new Error('Los minutos de recordatorio deben ser 0 o más.');

  // Meal times: se envía como JSON string
  let mealTimes: string[] = [];
  try {
    const rawMealTimes = formData.get('mealTimes') as string;
    if (rawMealTimes) mealTimes = JSON.parse(rawMealTimes);
  } catch { /* ignore */ }

  const priceStr = formData.get('price') as string;
  const price = priceStr && priceStr !== '' ? Number(priceStr) : null;

  const unit = (formData.get('unit') as string) || 'kg';

  await supabase.from('food_control').upsert({
    dog_id: dogId,
    food_name: (formData.get('foodName') as string) || '',
    brand: (formData.get('brand') as string) || '',
    food_type: (formData.get('foodType') as string) || '',
    total_quantity_kg: unit === 'g' ? totalRaw / 1000 : totalRaw,
    remaining_quantity_kg: unit === 'g' ? remainingRaw / 1000 : remainingRaw,
    unit,
    daily_ration_grams: dailyRationGrams,
    times_per_day: timesPerDay,
    purchase_date: (formData.get('purchaseDate') as string) || null,
    open_date: (formData.get('openDate') as string) || null,
    purchase_place: (formData.get('purchasePlace') as string) || '',
    price: isNaN(price as number) ? null : price,
    alert_threshold_days: alertThresholdDays > 0 ? alertThresholdDays : 7,
    meal_times: mealTimes,
    reminder_minutes: reminderMinutes,
    reminder_active: formData.get('reminderActive') === 'true',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'dog_id' });

  revalidatePath('/alimento');
  revalidatePath('/hoy');
}

// ── Acción rápida: sólo actualiza cantidad restante ───────────────────────────
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

// ── Acción legacy: registrar nuevo saco rápido ────────────────────────────────
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

// ── Acción legacy: actualiza configuración de consumo ─────────────────────────
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
