export default function ResultsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded" />
      <div className="bg-white p-4 rounded-xl border h-16" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border h-64" />
        <div className="bg-gray-900 rounded-xl h-64" />
      </div>
    </div>
  )
}
