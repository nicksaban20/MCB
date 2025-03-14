import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-bold">Authentication Error</h1>
        <p>There was a problem signing you in. Please try again.</p>
        <Link href="/login" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Return to Login
        </Link>
      </div>
    </div>
  )
}
