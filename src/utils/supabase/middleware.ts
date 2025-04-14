import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip middleware processing for the home route to avoid redirect loops
  if (request.nextUrl.pathname === '/') {
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
  const authRoutes = ['/signup', '/verify-email', '/auth'];
  const isAuthRoute = authRoutes.some(route => 
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
    !request.nextUrl.pathname.startsWith('/verify-email') &&
    request.nextUrl.pathname !== '/' // Don't redirect from the home page
  ) {
    // no user, redirect to home page for non-public routes
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}