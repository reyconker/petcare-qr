import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Auth callback handler for:
 * - Email confirmation
 * - Password reset (magic link)
 *
 * Supabase redirects to this route after email actions.
 * We exchange the code for a session, then redirect to the desired next page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/hoy';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the requested page (e.g. /nueva-contrasena for password reset)
      return NextResponse.redirect(`${origin}${next}`);
    }

    // Exchange failed: redirect with error
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('El enlace ha expirado o ya fue utilizado. Intenta nuevamente.')}`);
  }

  // No code present: redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
