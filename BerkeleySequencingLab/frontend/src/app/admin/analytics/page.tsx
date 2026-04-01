'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AnalyticsPayload = {
  orderVolumeByDay: { date: string; count: number }[]
  sampleTypeDistribution: { name: string; value: number }[]
  turnaroundDaysAvg: number | null
  totals: {
    orders: number
    pending: number
    in_progress: number
    completed: number
    customersWithOrgProfile: number
  }
}

function downloadCsv(rows: Record<string, string | number>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map((r) => headers.map((h) => String(r[h] ?? '')).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = useCallback(async () => {
    setError(null)
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const r = await fetch(`/api/admin/analytics?${params}`)
    if (!r.ok) setError((await r.json()).error || 'Failed')
    else setData(await r.json())
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-gray-600">Loading analytics…</p>

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics & reporting</h1>
          <p className="text-gray-600 text-sm mt-1">Order volume, sample types, turnaround</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border bg-white text-sm"
            onClick={() =>
              downloadCsv(
                data.orderVolumeByDay.map((d) => ({ date: d.date, orders: d.count })),
                'order_volume_by_day.csv'
              )
            }
          >
            Export volume CSV
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded border bg-white text-sm"
            onClick={() =>
              downloadCsv(
                data.sampleTypeDistribution.map((s) => ({ sample_type: s.name, count: s.value })),
                'sample_type_distribution.csv'
              )
            }
          >
            Export types CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">From</span>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">To</span>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        {(from || to) && (
          <button
            type="button"
            className="text-sm px-3 py-2 rounded border bg-white"
            onClick={() => { setFrom(''); setTo('') }}
          >
            Clear dates
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-gray-500">Total orders</p>
          <p className="text-2xl font-bold">{data.totals.orders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-gray-500">Avg turnaround (days)</p>
          <p className="text-2xl font-bold">{data.turnaroundDaysAvg ?? '—'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-gray-500">Org profiles</p>
          <p className="text-2xl font-bold">{data.totals.customersWithOrgProfile}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-xs text-gray-500">In progress</p>
          <p className="text-2xl font-bold">{data.totals.in_progress}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border h-80">
        <h2 className="font-semibold mb-2 text-sm">Orders per day</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data.orderVolumeByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" name="Orders" stroke="#003262" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-xl border h-80">
        <h2 className="font-semibold mb-2 text-sm">Sample type distribution</h2>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={data.sampleTypeDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="value" name="Count" fill="#FDB515" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
