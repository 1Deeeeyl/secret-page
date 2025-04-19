import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip middleware processing for the home route to avoid redirect loops
  const hasSupabaseAuthParams =
    request.nextUrl.searchParams.has('access_token') ||
    request.nextUrl.searchParams.has('refresh_token') ||
    request.nextUrl.searchParams.has('type') ||
    request.nextUrl.searchParams.has('error') ||
    request.nextUrl.searchParams.has('code'); // sometimes used in magic links
  if (request.nextUrl.pathname === '/' || hasSupabaseAuthParams) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define auth routes that logged-in users shouldn't access
  const authRoutes = ['/signup', '/auth', '/request-password'];
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth routes
  if (user && isAuthRoute) {
    // user is logged in but trying to access auth routes, redirect to dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/'; // or any other authenticated landing page
    return NextResponse.redirect(url);
  }

  // Only protect specific routes, not the home route
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/request-password') &&
    request.nextUrl.pathname !== '/' // Don't redirect from the home page
  ) {
    // no user, redirect to home page for non-public routes
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
