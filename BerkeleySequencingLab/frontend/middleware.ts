import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const publicPaths = ['/login', '/signup', '/auth-error', '/api', '/hero']
  const isPublic = publicPaths.some((p) => pathname.startsWith(p)) || pathname === '/'

  if (isPublic) {
    return NextResponse.next()
  }

  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
