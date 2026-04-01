import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { userIsAdmin } from '@/lib/admin-auth'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !userIsAdmin(user)) {
    redirect('/unauthorized')
  }

  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ||
    (user.user_metadata?.picture as string | undefined) ||
    ''

  return (
    <AdminShell user={user} avatarUrl={avatarUrl}>
      {children}
    </AdminShell>
  )
}
