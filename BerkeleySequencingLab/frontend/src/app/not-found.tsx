import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="text-6xl font-bold text-[#003262] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/hero"
          className="inline-block px-6 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
