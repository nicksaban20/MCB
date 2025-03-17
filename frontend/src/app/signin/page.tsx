import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Auth from '@/components/Auth'

export default async function LoginPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect('/')
  }

  return (
    <div className="flex bg-white min-h-screen flex-col items-center justify-center">
      <div className="w-full xl:max-w-[70vw] space-y-8">
        <Auth />
      </div>
    </div>
  )
}
