import { redirect } from 'next/navigation'
import Auth from '@/components/Auth'
import { createClient } from '@/utils/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <Auth />
}
