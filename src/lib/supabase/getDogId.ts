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
    console.error('[DEBUG ONBOARDING HARD] getDogId: No user, redirecting to /login');
    redirect('/login');
  }

  const cookieStore = await cookies();
  const cookieDogId = cookieStore.get('active_dog_id')?.value;
  console.error('[DEBUG ONBOARDING HARD] getDogId: User', user.id, '| Cookie active_dog_id:', cookieDogId);

  // Fetch ALL dogs for the user first to validate against database truth
  const { data: dogs } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  console.error('[DEBUG ONBOARDING HARD] getDogId: DB query returned dogs count:', dogs?.length, '| DB data:', JSON.stringify(dogs));

  // If DB says the user has NO dogs, we MUST redirect to onboarding, regardless of any stale cookie.
  if (!dogs || dogs.length === 0) {
    console.error('[DEBUG ONBOARDING HARD] getDogId: User has 0 dogs in DB. Redirecting to /onboarding');
    redirect('/onboarding');
  }

  // If cookie exists, validate that the ID actually belongs to this user (exists in the dogs array)
  if (cookieDogId && dogs.some(d => d.id === cookieDogId)) {
    console.error('[DEBUG ONBOARDING HARD] getDogId: Found valid cookie for user, returning early:', cookieDogId);
    return cookieDogId;
  }

  // If no cookie or invalid cookie, default to the first dog found in the database.
  const firstDogId = dogs[0].id;
  console.error('[DEBUG ONBOARDING HARD] getDogId: Cookie missing or invalid. Defaulting to first dog:', firstDogId);

  try {
    cookieStore.set('active_dog_id', firstDogId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    console.error('[DEBUG ONBOARDING HARD] getDogId: Cookie active_dog_id set manually to:', firstDogId);
  } catch (err) {
    console.error('[DEBUG ONBOARDING HARD] getDogId: Caught error setting cookie in Server Component context (ignored)', err);
  }

  return firstDogId;
}
