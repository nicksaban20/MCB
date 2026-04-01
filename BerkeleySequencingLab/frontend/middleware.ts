import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signin', '/signup', '/auth', '/auth-error', '/api', '/unauthorized'];
const ADMIN_PATHS = ['/admin-dash', '/plate-selection'];
const SUPERADMIN_PATHS = ['/superadmin'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => (path === '/' ? pathname === '/' : pathname.startsWith(path)));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    url.searchParams.set('reason', 'auth');
    return NextResponse.redirect(url);
  }

  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isSuperadminPath = SUPERADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (user && (isAdminPath || isSuperadminPath)) {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('RBAC middleware role lookup failed:', error);
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('reason', 'role');
      return NextResponse.redirect(url);
    }

    const role = profile?.role;
    const isStaff = role === 'staff' || role === 'superadmin';
    const isSuperadmin = role === 'superadmin';

    if (isAdminPath && !isStaff) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('reason', 'admin');
      return NextResponse.redirect(url);
    }

    if (isSuperadminPath && !isSuperadmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('reason', 'superadmin');
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
