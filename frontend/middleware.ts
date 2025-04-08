// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // create supabase client for auth checking
  const supabase = createMiddlewareClient({ req, res });
  
  // check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // get the pathname
  const { pathname } = req.nextUrl;
  
  // list of paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/auth-error', '/api'];
  
  // check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === '/'
  );
  
  // if user is not authenticated and trying to access a protected route,
  // redirect to the 403 page
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  
  return res;
}

// define on which paths the middleware should run
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};