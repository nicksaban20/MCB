import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - signin (signin page)
     * - auth-error (auth error page)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|signin|auth-error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}