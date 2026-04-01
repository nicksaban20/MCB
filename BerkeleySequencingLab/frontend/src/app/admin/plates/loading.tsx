export default function PlatesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="flex gap-4">
        <div className="w-72 bg-gray-50 border rounded-xl h-96" />
        <div className="flex-1 bg-white rounded-xl border h-96" />
      </div>
    </div>
  )
}
