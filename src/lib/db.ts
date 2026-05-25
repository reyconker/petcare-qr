/**
 * lib/db.ts — Supabase Edition
 *
 * Replaces the old data.json file system.
 * getDbData() loads all app data for the authenticated user's dog.
 * saveDbData() is no longer needed — all mutations happen through
 * individual server actions that call Supabase directly.
 *
 * This compatibility shim lets pages like /hoy, /dashboard, etc.
 * keep working unchanged while we migrate Server Actions one by one.
 */

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { AppData, Dog, Treatment, DoseHistory, Recipe, FoodControl, Vaccine, QrSettings } from '@/types';

export async function getDbData(): Promise<AppData> {
  noStore();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  console.error('[DEBUG ONBOARDING HARD][db.ts] user.id:', user.id);

  const dogId = await getDogId();
  console.error('[DEBUG ONBOARDING HARD][db.ts] dogId from getDogId:', dogId);

  const SELECT_FIELDS = 'id, name, species, breed, gender, weight, photo_url, age_text, birth_date, color, microchip, allergies, diseases, emergency_notes, owner_name, owner_phone, owner_email, qr_enabled, qr_show_allergies, qr_show_conditions, qr_show_treatments, qr_show_vaccines, qr_show_owner_contact, qr_show_emergency_notes, public_qr_token';

  // Primary lookup: by dogId AND user_id (RLS-safe, no stale ID risk)
  const { data: dogRowPrimary, error: dogErrorPrimary } = await supabase
    .from('dog_profiles')
    .select(SELECT_FIELDS)
    .eq('id', dogId)
    .eq('user_id', user.id)
    .maybeSingle();

  console.error('[DEBUG ONBOARDING HARD][db.ts] Primary dogRow result:', { id: dogRowPrimary?.id, error: dogErrorPrimary?.message });

  let dogRow = dogRowPrimary;

  // Fallback: if primary lookup failed, search any dog belonging to this user
  if (!dogRow) {
    console.error('[DEBUG ONBOARDING HARD][db.ts] Primary lookup failed. Running fallback query by user_id:', user.id);
    const { data: fallbackRow, error: fallbackError } = await supabase
      .from('dog_profiles')
      .select(SELECT_FIELDS)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    console.error('[DEBUG ONBOARDING HARD][db.ts] Fallback result:', { id: fallbackRow?.id, error: fallbackError?.message });
    dogRow = fallbackRow;
  }

  // Only redirect to /onboarding if both primary and fallback returned nothing
  if (!dogRow) {
    console.error('[DEBUG ONBOARDING HARD][db.ts] No dog found for user. Redirecting to /onboarding.');
    redirect('/onboarding');
  }

  // Fetch all related data in parallel
  const [
    { data: treatmentsRaw },
    { data: historyRaw },
    { data: recipesRaw },
    { data: vaccinesRaw },
    { data: foodRaw },
  ] = await Promise.all([
    supabase.from('treatments').select('*').eq('dog_id', dogId).order('created_at', { ascending: false }),
    supabase.from('dose_history').select('*').eq('dog_id', dogId).order('given_at', { ascending: true }),
    supabase.from('recipes').select('*').eq('dog_id', dogId).order('created_at', { ascending: false }),
    supabase.from('vaccines').select('*').eq('dog_id', dogId).order('created_at', { ascending: false }),
    supabase.from('food_control').select('*').eq('dog_id', dogId).single(),
  ]);

  // Generate signed URLs for private recipes
  const processedRecipesRaw = await Promise.all((recipesRaw ?? []).map(async (r) => {
    let finalImageUrl = r.image_url;
    if (finalImageUrl && !finalImageUrl.startsWith('http')) {
      const { data } = await supabase.storage.from('petcare-private').createSignedUrl(finalImageUrl, 3600);
      if (data) finalImageUrl = data.signedUrl;
    }
    return { ...r, image_url: finalImageUrl };
  }));

  // Map snake_case DB columns → camelCase TypeScript types
  const dog: Dog = {
    id: dogRow.id,
    name: dogRow.name,
    photoUrl: dogRow.photo_url,
    species: dogRow.species ?? 'Perro',
    breed: dogRow.breed,
    gender: dogRow.gender as 'Macho' | 'Hembra',
    birthDate: dogRow.birth_date,
    ageText: dogRow.age_text,
    weight: dogRow.weight,
    color: dogRow.color,
    microchip: dogRow.microchip,
    allergies: dogRow.allergies || [],
    diseases: dogRow.diseases || [],
    emergencyNotes: dogRow.emergency_notes || '',
    publicQrToken: dogRow.public_qr_token,
    owner: {
      name: dogRow.owner_name ?? '',
      phone: dogRow.owner_phone ?? '',
      email: dogRow.owner_email ?? '',
    },
  };

  const treatments: Treatment[] = (treatmentsRaw ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    reason: t.reason ?? '',
    startDate: t.start_date ?? '',
    endDate: t.end_date ?? '',
    frequencyHours: t.frequency_hours ?? 12,
    doseAmount: t.dose_amount ?? 1,
    unit: t.unit ?? 'ml',
    initialQuantity: t.initial_quantity ?? 0,
    remainingQuantity: t.remaining_quantity ?? 0,
    state: t.state as Treatment['state'],
    notes: t.notes ?? '',
    recipeId: t.recipe_id ?? undefined,
  }));

  const doseHistory: DoseHistory[] = (historyRaw ?? []).map((h) => ({
    id: h.id,
    treatmentId: h.treatment_id ?? '',
    medicineName: h.medicine_name,
    doseAmount: h.dose_amount,
    unit: h.unit ?? 'ml',
    givenAt: h.given_at,
    status: h.status as 'dada' | 'omitida',
    notes: h.notes ?? '',
  }));

  const recipes: Recipe[] = processedRecipesRaw.map((r) => ({
    id: r.id,
    title: r.title,
    date: r.date ?? '',
    vetName: r.vet_name ?? '',
    clinic: r.clinic ?? '',
    diagnosis: r.diagnosis ?? '',
    instructions: r.instructions ?? '',
    imageUrl: r.image_url ?? '',
    relatedTreatmentId: r.related_treatment_id ?? undefined,
    notes: r.notes ?? '',
  }));

  const vaccines: Vaccine[] = (vaccinesRaw ?? []).map((v) => ({
    id: v.id,
    type: v.type as 'vacuna' | 'desparasitación',
    name: v.name,
    applicationDate: v.application_date ?? '',
    nextDate: v.next_date ?? '',
    veterinarian: v.veterinarian ?? '',
    notes: v.notes ?? '',
    state: v.state as Vaccine['state'],
  }));

  const food: FoodControl = foodRaw
    ? {
        id: foodRaw.id,
        brand: foodRaw.brand ?? '',
        foodType: foodRaw.food_type ?? '',
        totalQuantityKg: foodRaw.total_quantity_kg ?? 0,
        remainingQuantityKg: foodRaw.remaining_quantity_kg ?? 0,
        dailyRationGrams: foodRaw.daily_ration_grams ?? 200,
        timesPerDay: foodRaw.times_per_day ?? 2,
        purchaseDate: foodRaw.purchase_date ?? '',
        alertThresholdDays: foodRaw.alert_threshold_days ?? 7,
      }
    : {
        id: dogId,
        brand: 'Sin registrar',
        foodType: 'Seco',
        totalQuantityKg: 0,
        remainingQuantityKg: 0,
        dailyRationGrams: 200,
        timesPerDay: 2,
        purchaseDate: '',
        alertThresholdDays: 7,
      };

  const qrSettings: QrSettings = {
    enabled: dogRow.qr_enabled ?? true,
    showAllergies: dogRow.qr_show_allergies ?? true,
    showConditions: dogRow.qr_show_conditions ?? true,
    showActiveTreatments: dogRow.qr_show_treatments ?? true,
    showVaccines: dogRow.qr_show_vaccines ?? true,
    showOwnerContact: dogRow.qr_show_owner_contact ?? true,
    showEmergencyNotes: dogRow.qr_show_emergency_notes ?? true,
  };

  return { dog, treatments, doseHistory, prescriptions: [], recipes, food, vaccines, qrSettings };
}

/**
 * @deprecated — No longer used. Mutations go through individual Supabase calls.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function saveDbData(_data: AppData): Promise<void> {
  console.warn('saveDbData() is deprecated. Use Supabase Server Actions directly.');
}
