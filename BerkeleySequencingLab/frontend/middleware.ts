import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signin', '/signup', '/auth', '/auth-error', '/api', '/unauthorized'];
const ADMIN_PATHS = ['/admin-dash', '/plate-selection'];
const SUPERADMIN_PATHS = ['/superadmin'];
const LAST_ACTIVITY_COOKIE = 'mcb-last-activity';
const DEFAULT_SESSION_TIMEOUT_MINUTES = 30;

function getSessionTimeoutMs() {
  const configuredMinutes = Number(process.env.SESSION_TIMEOUT_MINUTES ?? DEFAULT_SESSION_TIMEOUT_MINUTES);
  const safeMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_SESSION_TIMEOUT_MINUTES;

  return safeMinutes * 60 * 1000;
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => (path === '/' ? pathname === '/' : pathname.startsWith(path)));
}

function clearSessionCookies(request: NextRequest, redirectPath: string, reason: string) {
  const url = request.nextUrl.clone();
  url.pathname = redirectPath;
  url.searchParams.set('reason', reason);

  const response = NextResponse.redirect(url);
  const cookiesToClear = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith('sb-') || cookie.name === LAST_ACTIVITY_COOKIE);

  cookiesToClear.forEach((cookie) => {
    response.cookies.set(cookie.name, '', {
      expires: new Date(0),
      path: '/',
    });
  });

  return response;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  let profile: { role?: string | null; is_active?: boolean | null } | null = null;

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

  if (user) {
    const { data, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle();

    profile = data;

    if (profileError) {
      console.error('RBAC middleware role lookup failed:', profileError);
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('reason', 'role');
      return NextResponse.redirect(url);
    }

    if (profile?.is_active === false) {
      return clearSessionCookies(request, '/unauthorized', 'deactivated');
    }

    const lastActivity = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value;
    const now = Date.now();
    const sessionTimeoutMs = getSessionTimeoutMs();

    if (lastActivity) {
      const lastActivityTimestamp = Number(lastActivity);
      if (Number.isFinite(lastActivityTimestamp) && now - lastActivityTimestamp > sessionTimeoutMs) {
        return clearSessionCookies(request, '/login', 'timeout');
      }
    }

    response.cookies.set(LAST_ACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Math.floor(sessionTimeoutMs / 1000),
    });
  }

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/unauthorized';
    url.searchParams.set('reason', 'auth');
    return NextResponse.redirect(url);
  }

  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isSuperadminPath = SUPERADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (user && (isAdminPath || isSuperadminPath)) {
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
