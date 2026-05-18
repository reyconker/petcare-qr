'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Returns the currently active dog ID for the authenticated user.
 * Priority: cookie → first dog in DB → onboarding
 */
export async function getDogId(): Promise<string> {
  noStore(); // Completely opt-out of Next.js cache for this function

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('[DEBUG getDogId] No user, redirecting to /login');
    redirect('/login');
  }

  const cookieStore = await cookies();
  const cookieDogId = cookieStore.get('active_dog_id')?.value;
  console.log('[DEBUG getDogId] User:', user.id, 'Cookie active_dog_id:', cookieDogId);

  // Since RLS protects all queries anyway, we can trust the cookie to save a DB query.
  if (cookieDogId) {
    console.log('[DEBUG getDogId] Found cookie, returning early:', cookieDogId);
    return cookieDogId;
  }

  // Fetch all dogs for user if no cookie is set
  const { data: dogs } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  console.log('[DEBUG getDogId] DB query returned dogs count:', dogs?.length);

  if (!dogs || dogs.length === 0) {
    console.log('[DEBUG getDogId] No dogs found in DB. Redirecting to /onboarding');
    redirect('/onboarding');
  }

  // Default to first dog and try to set cookie (will fail silently in Server Components, which is fine)
  const firstDogId = dogs[0].id;
  try {
    cookieStore.set('active_dog_id', firstDogId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    console.log('[DEBUG getDogId] Cookie active_dog_id set manually to first dog:', firstDogId);
  } catch {
    console.log('[DEBUG getDogId] Caught error setting cookie in Server Component context (ignored)');
  }

  return firstDogId;
}
