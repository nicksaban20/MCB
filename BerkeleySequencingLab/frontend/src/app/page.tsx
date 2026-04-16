import Link from 'next/link'
import SequencingTxtLink from '@/components/SequencingTxtLink';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-center">Welcome to Berkeley Sequencing Lab</h1>
        
        <p className="text-center text-xl">
        Place any components you dont know where to put here <br></br>Label: name, component name
        </p>
      <SequencingTxtLink />
        
        <div className="flex justify-center space-x-4">
          {user ? (
            <>
              <p className="text-center">Logged in as {user.email}</p>
              <Link href="/profile" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                View Profile
              </Link>
            </>
          ) : (
            <Link href="/hero" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Continue to app
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
