import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export function userIsAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const app = user.app_metadata as Record<string, unknown> | undefined
  return Boolean(meta?.is_admin === true || app?.is_admin === true)
}

/** Server routes: returns supabase + user or 403 response */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !userIsAdmin(user)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }
  return { ok: true as const, user, supabase }
}
