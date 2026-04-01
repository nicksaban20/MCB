export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="h-4 w-96 bg-gray-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 h-20" />
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 h-64" />
    </div>
  )
}
