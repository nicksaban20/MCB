export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border h-20" />
        ))}
      </div>
      <div className="bg-white p-4 rounded-xl border h-80" />
      <div className="bg-white p-4 rounded-xl border h-80" />
    </div>
  )
}
