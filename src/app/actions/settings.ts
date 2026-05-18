'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

export async function updateQrSettings(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  await supabase.from('dog_profiles').update({
    qr_enabled: formData.get('enabled') === 'on',
    qr_show_allergies: formData.get('showAllergies') === 'on',
    qr_show_conditions: formData.get('showConditions') === 'on',
    qr_show_treatments: formData.get('showActiveTreatments') === 'on',
    qr_show_vaccines: formData.get('showVaccines') === 'on',
    qr_show_owner_contact: formData.get('showOwnerContact') === 'on',
    qr_show_emergency_notes: formData.get('showEmergencyNotes') === 'on',
  }).eq('id', dogId);

  revalidatePath('/qr-config');
}

export async function regenerateQrToken() {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  // Use crypto.randomUUID() for a new unique token
  const newToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  
  await supabase.from('dog_profiles').update({
    public_qr_token: newToken
  }).eq('id', dogId);

  revalidatePath('/qr-config');
}
