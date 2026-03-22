import { User } from '@supabase/supabase-js'

export function isAdmin(user: User | null): boolean {
  return user?.user_metadata?.is_admin === true
}
