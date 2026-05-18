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

  // Since RLS protects all queries anyway, we can trust the cookie to save a DB query.
  // If the dog was deleted, queries will return empty and the UI will adapt or redirect.
  if (cookieDogId) {
    return cookieDogId;
  }

  // Fetch all dogs for user if no cookie is set
  const { data: dogs } = await supabase
    .from('dog_profiles')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!dogs || dogs.length === 0) redirect('/onboarding');

  // Default to first dog and try to set cookie (will fail silently in Server Components, which is fine)
  const firstDogId = dogs[0].id;
  try {
    cookieStore.set('active_dog_id', firstDogId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
  } catch {
    // Next.js throws an error if setting cookies from a Server Component during render.
    // We ignore it; the fallback to dogs[0].id will keep working for this request.
  }

  return firstDogId;
}
