'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Returns the currently active dog ID for the authenticated user.
 * Priority: cookie → first dog in DB → onboarding
 */
export async function getDogId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const cookieStore = await cookies();
  const cookieDogId = cookieStore.get('active_dog_id')?.value;

  // Fetch all dogs for user
  const { data: dogs } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!dogs || dogs.length === 0) redirect('/onboarding');

  // Validate cookie dog ID belongs to this user
  if (cookieDogId && dogs.some(d => d.id === cookieDogId)) {
    return cookieDogId;
  }

  // Default to first dog and set cookie
  const firstDogId = dogs[0].id;
  cookieStore.set('active_dog_id', firstDogId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return firstDogId;
}
