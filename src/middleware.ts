import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required for Server Components
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Public routes — always accessible (no login required)
  const publicRoutes = [
    '/qr',
    '/register',
    '/login',
    '/recuperar',
    '/nueva-contrasena',
    '/auth/callback',
    '/privacidad',
    '/terminos',
    '/onboarding',
  ];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return supabaseResponse;
  }

  // Redirect to login if not authenticated on private routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect root
  if (pathname === '/') {
    return NextResponse.redirect(new URL(user ? '/hoy' : '/login', request.url));
  }

  // Redirect authenticated users without a dog profile to onboarding
  // (checked inside the layout to avoid extra DB calls in middleware)

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
