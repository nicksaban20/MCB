'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi'
import { SAMPLE_STATUSES } from '@/lib/order-lifecycle'
import type { SampleRow } from '@/lib/admin-types'
import { useToast } from '@/components/Toast'

type SortKey = 'name' | 'sample_type' | 'status' | 'plate_id' | 'flag_for_review'
type SortDir = 'asc' | 'desc'

export default function AdminSamplesPage() {
  const { addToast } = useToast()
  const [rows, setRows] = useState<SampleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState('')
  const [plateId, setPlateId] = useState('all')
  const [status, setStatus] = useState('all')
  const [flagged, setFlagged] = useState(false)
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [plates, setPlates] = useState<{ id: string; name: string }[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(debounceRef.current)
  }, [q])

  const loadPlates = useCallback(async () => {
    const r = await fetch('/api/admin/plates')
    if (r.ok) setPlates(await r.json())
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (orderId.trim()) params.set('orderId', orderId.trim())
      if (plateId === 'unassigned') params.set('plateId', 'unassigned')
      else if (plateId !== 'all') params.set('plateId', plateId)
      if (status !== 'all') params.set('status', status)
      if (flagged) params.set('flagged', '1')
      if (debouncedQ.trim()) params.set('q', debouncedQ.trim())
      const r = await fetch(`/api/admin/samples?${params}`)
      if (!r.ok) throw new Error((await r.json()).error || 'Failed')
      setRows(await r.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [orderId, plateId, status, flagged, debouncedQ])

  useEffect(() => {
    loadPlates()
  }, [loadPlates])

  useEffect(() => {
    load()
  }, [load])

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      let av: string, bv: string
      if (sortKey === 'sample_type') {
        av = (a.dna_orders?.sample_type || '').toLowerCase()
        bv = (b.dna_orders?.sample_type || '').toLowerCase()
      } else if (sortKey === 'flag_for_review') {
        av = a.flag_for_review ? '1' : '0'
        bv = b.flag_for_review ? '1' : '0'
      } else {
        av = String(a[sortKey] || '').toLowerCase()
        bv = String(b[sortKey] || '').toLowerCase()
      }
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const allSelected = sorted.length > 0 && sorted.every((r) => selected.has(r.id))

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(sorted.map((r) => r.id)))
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null

  const bulk = async (body: Record<string, unknown>) => {
    if (selected.size === 0) return
    const r = await fetch('/api/admin/samples/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], ...body }),
    })
    if (!r.ok) addToast((await r.json()).error || 'Failed', 'error')
    else {
      addToast(`${selected.size} sample(s) updated`, 'success')
      setSelected(new Set())
      load()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Samples</h1>
          <p className="text-gray-600 text-sm mt-1">All samples across orders — filter, bulk actions, detail</p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-xl border">
        <label className="text-sm">
          Order ID
          <input
            className="block border rounded px-2 py-1 mt-1 w-56 font-mono text-xs"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="uuid…"
          />
        </label>
        <label className="text-sm">
          Plate
          <select
            className="block border rounded px-2 py-1 mt-1"
            value={plateId}
            onChange={(e) => setPlateId(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {plates.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Status
          <select
            className="block border rounded px-2 py-1 mt-1"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            {SAMPLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm flex items-center gap-2 mt-6">
          <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />
          Flagged only
        </label>
        <label className="text-sm">
          Search
          <input
            className="block border rounded px-2 py-1 mt-1"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="name, notes…"
          />
        </label>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => bulk({ flag_for_review: true })}>
            Flag review
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => bulk({ flag_for_review: false })}>
            Unflag
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => bulk({ status: 'processing' })}>
            Set processing
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => bulk({ status: 'completed' })}>
            Set completed
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => bulk({ plate_id: null })}>
            Clear plate
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded border bg-white" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-2 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                Sample <SortIcon col="name" />
              </th>
              <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('sample_type')}>
                Order type <SortIcon col="sample_type" />
              </th>
              <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                Status <SortIcon col="status" />
              </th>
              <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('plate_id')}>
                Plate / well <SortIcon col="plate_id" />
              </th>
              <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('flag_for_review')}>
                Flag <SortIcon col="flag_for_review" />
              </th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-2">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                </td>
                <td className="p-2 font-medium">{r.name || r.id.slice(0, 8)}</td>
                <td className="p-2">{r.dna_orders?.sample_type || '—'}</td>
                <td className="p-2">{r.status || '—'}</td>
                <td className="p-2 font-mono text-xs">
                  {r.plate_id ? `${r.plate_id.slice(0, 6)}…` : '—'}
                  {r.well_index != null ? ` @ ${r.well_index}` : ''}
                </td>
                <td className="p-2">{r.flag_for_review ? '⚑' : ''}</td>
                <td className="p-2">
                  <Link href={`/admin/samples/${r.id}`} className="text-blue-600 hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <p className="p-6 text-center text-gray-500">No samples.</p>}
      </div>
    </div>
  )
}
