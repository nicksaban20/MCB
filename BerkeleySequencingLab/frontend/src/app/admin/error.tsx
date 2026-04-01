'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center space-y-3">
        <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
        <p className="text-sm text-red-600">{error.message || 'An unexpected error occurred.'}</p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-[#003262] text-[#FDB515] text-sm font-medium hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
