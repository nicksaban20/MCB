import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function checkAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return { user }
}
