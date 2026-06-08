'use server';

import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { revalidatePath } from 'next/cache';

export async function addTreatment(formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  const frequencyHours = Math.max(1, Number(formData.get('frequencyHours')));
  const doseAmount = Math.max(0.01, Number(formData.get('doseAmount')));
  const initialQuantity = Math.max(0, Number(formData.get('initialQuantity')));
  const name = formData.get('name') as string;
  const isPermanent = formData.get('isPermanent') === 'true';
  const rawEndDate = formData.get('endDate') as string | null;

  if (!name || name.trim() === '') {
    throw new Error('El nombre del tratamiento es obligatorio.');
  }

  await supabase.from('treatments').insert({
    dog_id: dogId,
    name: name.trim(),
    reason: formData.get('reason') as string,
    start_date: formData.get('startDate') as string,
    // For permanent treatments end_date is null; for temporal it is required
    end_date: isPermanent ? null : (rawEndDate || null),
    frequency_hours: frequencyHours,
    dose_amount: doseAmount,
    unit: formData.get('unit') as string,
    initial_quantity: initialQuantity,
    remaining_quantity: initialQuantity,
    state: 'activo',
    notes: formData.get('notes') as string ?? '',
    is_permanent: isPermanent,
  });

  revalidatePath('/tratamientos');
  revalidatePath('/hoy');
}

export async function editTreatment(id: string, formData: FormData) {
  const supabase = await createClient();
  const dogId = await getDogId();
  
  const frequencyHours = Math.max(1, Number(formData.get('frequencyHours')));
  const doseAmount = Math.max(0.01, Number(formData.get('doseAmount')));
  const initialQuantity = Math.max(0, Number(formData.get('initialQuantity')));
  const remainingInput = Number(formData.get('remainingQuantity'));
  const isPermanent = formData.get('isPermanent') === 'true';
  const rawEndDate = formData.get('endDate') as string | null;
  
  // Validate remaining quantity
  const remainingQuantity = Math.max(0, Math.min(initialQuantity, isNaN(remainingInput) ? initialQuantity : remainingInput));
  
  const name = formData.get('name') as string;
  if (!name || name.trim() === '') {
    throw new Error('El nombre del tratamiento es obligatorio.');
  }

  const state = formData.get('state') as string;
  if (!['activo', 'finalizado', 'suspendido'].includes(state)) {
    throw new Error('Estado inválido.');
  }

  await supabase.from('treatments').update({
    name: name.trim(),
    reason: formData.get('reason') as string,
    start_date: formData.get('startDate') as string,
    end_date: isPermanent ? null : (rawEndDate || null),
    frequency_hours: frequencyHours,
    dose_amount: doseAmount,
    unit: formData.get('unit') as string,
    initial_quantity: initialQuantity,
    remaining_quantity: remainingQuantity,
    notes: formData.get('notes') as string,
    state: state,
    is_permanent: isPermanent,
  }).eq('id', id).eq('dog_id', dogId);

  revalidatePath('/tratamientos');
  revalidatePath('/hoy');
}

export async function deleteTreatment(id: string) {
  const supabase = await createClient();
  const dogId = await getDogId();
  await supabase.from('treatments').delete().eq('id', id).eq('dog_id', dogId);
  revalidatePath('/tratamientos');
  revalidatePath('/hoy');
}

export async function markDoseAsGiven(
  treatmentId: string,
  medicineName: string,
  doseAmount: number,
  unit: string
) {
  const supabase = await createClient();
  const dogId = await getDogId();

  // 1. Fetch treatment to check status, stock, and frequency
  const { data: treatment } = await supabase
    .from('treatments')
    .select('state, remaining_quantity, frequency_hours')
    .eq('id', treatmentId)
    .eq('dog_id', dogId)
    .single();

  if (!treatment) throw new Error('Tratamiento no encontrado o no pertenece a la mascota activa.');
  if (treatment.state !== 'activo') throw new Error('El tratamiento no está activo.');
  if (treatment.remaining_quantity < doseAmount) throw new Error('No hay suficiente medicamento para esta dosis.');

  // 2. Prevent duplicate doses
  // Check if a dose was given within 80% of the frequency_hours
  const hoursWindow = treatment.frequency_hours * 0.8;
  const timeLimit = new Date(Date.now() - hoursWindow * 60 * 60 * 1000).toISOString();

  const { data: recentDose } = await supabase
    .from('dose_history')
    .select('id')
    .eq('treatment_id', treatmentId)
    .eq('dog_id', dogId)
    .gte('given_at', timeLimit)
    .limit(1);

  if (recentDose && recentDose.length > 0) {
    console.error('Dosis duplicada prevenida. Ya se registró una dosis recientemente.');
    // Retornamos sin descontar ni registrar la dosis.
    return { error: 'Dosis duplicada prevenida. Ya se registró una dosis recientemente.' };
  }

  // 3. Insert dose history record
  await supabase.from('dose_history').insert({
    dog_id: dogId,
    treatment_id: treatmentId,
    medicine_name: medicineName,
    dose_amount: doseAmount,
    unit,
    given_at: new Date().toISOString(),
    status: 'dada',
    notes: '',
  });

  // 4. Decrement remaining quantity
  const newRemaining = Math.max(0, treatment.remaining_quantity - doseAmount);
  await supabase
    .from('treatments')
    .update({ remaining_quantity: newRemaining })
    .eq('id', treatmentId)
    .eq('dog_id', dogId);

  revalidatePath('/tratamientos');
  revalidatePath('/hoy');
  revalidatePath('/historial-dosis');
  
  return { success: true };
}
