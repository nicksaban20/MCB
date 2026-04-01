'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiActivity, FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiRefreshCw } from 'react-icons/fi'
import { ORDER_STATUSES } from '@/lib/order-lifecycle'
import type { OrderRow, StatusEvent } from '@/lib/admin-types'
import { useToast } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

function formatDate(s: string) {
  const d = new Date(s)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type SortKey = 'customer_label' | 'sample_type' | 'plate_name' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

export default function AdminOrdersPage() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [events, setEvents] = useState<StatusEvent[]>([])
  const [sampleCount, setSampleCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editOrder, setEditOrder] = useState<OrderRow | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [confirm, setConfirm] = useState<{ status: string } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(debounceRef.current)
  }, [q])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (from) params.set('from', new Date(from).toISOString())
      if (to) params.set('to', new Date(to).toISOString())
      if (debouncedQ.trim()) params.set('q', debouncedQ.trim())

      const res = await fetch(`/api/admin/orders?${params}`)
      if (!res.ok) throw new Error((await res.json()).error || 'Failed orders')
      setOrders(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, from, to, debouncedQ])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    ;(async () => {
      const [eRes, sRes] = await Promise.all([
        fetch('/api/admin/events'),
        fetch('/api/admin/samples'),
      ])
      if (eRes.ok) setEvents(await eRes.json())
      if (sRes.ok) {
        const sJson = await sRes.json()
        setSampleCount(Array.isArray(sJson) ? sJson.length : 0)
      }
    })()
  }, [])

  const sorted = useMemo(() => {
    const copy = [...orders]
    copy.sort((a, b) => {
      const av = String(a[sortKey] || '').toLowerCase()
      const bv = String(b[sortKey] || '').toLowerCase()
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [orders, sortKey, sortDir])

  const stats = {
    pending: orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length,
    in_progress: orders.filter((o) => (o.status || '').toLowerCase() === 'in_progress').length,
    completed: orders.filter((o) => (o.status || '').toLowerCase() === 'completed').length,
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null

  const toggleSel = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const allSelected = sorted.length > 0 && sorted.every((o) => selected.has(o.id))

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(sorted.map((o) => o.id)))
  }

  const batchSetStatus = async (status: string) => {
    if (selected.size === 0) return
    const res = await fetch('/api/admin/orders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], status }),
    })
    if (!res.ok) {
      addToast((await res.json()).error || 'Batch failed', 'error')
      return
    }
    addToast(`${selected.size} order(s) updated to ${status}`, 'success')
    setSelected(new Set())
    load()
  }

  const openEdit = (o: OrderRow) => {
    setEditOrder(o)
    setEditStatus(o.status || 'pending')
    setEditNotes(o.internal_notes || '')
  }

  const saveEdit = async () => {
    if (!editOrder) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${editOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, internal_notes: editNotes }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      addToast('Order updated', 'success')
      setEditOrder(null)
      load()
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading && orders.length === 0) {
    return <p className="text-gray-600">Loading admin orders…</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order management</h1>
          <p className="text-gray-600 mt-1">CRUD, filters, internal notes, batch status updates</p>
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total samples (rows)</p>
          <p className="text-3xl font-bold">{sampleCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm flex items-center gap-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center gap-3">
          <FiActivity className="text-blue-600 text-xl" />
          <div>
            <p className="text-sm text-gray-500">In progress</p>
            <p className="text-2xl font-bold">{stats.in_progress}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center gap-3">
          <FiClock className="text-amber-600 text-xl" />
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">Status</span>
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="block text-gray-500 mb-1">Search</span>
          <input
            className="border rounded-lg px-3 py-2 text-sm w-48"
            placeholder="Customer, type, plate…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
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
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 items-center bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <button
            type="button"
            className="text-sm px-3 py-1 rounded bg-white border"
            onClick={() => setConfirm({ status: 'in_progress' })}
          >
            Mark in progress
          </button>
          <button
            type="button"
            className="text-sm px-3 py-1 rounded bg-white border"
            onClick={() => setConfirm({ status: 'completed' })}
          >
            Mark completed
          </button>
          <button type="button" className="text-sm px-3 py-1 rounded bg-white border" onClick={() => setSelected(new Set())}>
            Clear
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Confirm batch status change"
        message={`Set ${selected.size} order(s) to "${confirm?.status?.replace('_', ' ')}"?`}
        confirmLabel="Update"
        onConfirm={() => {
          if (confirm) batchSetStatus(confirm.status)
          setConfirm(null)
        }}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('customer_label')}>
                  Customer <SortIcon col="customer_label" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('sample_type')}>
                  Type <SortIcon col="sample_type" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('plate_name')}>
                  Plate <SortIcon col="plate_name" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('status')}>
                  Status <SortIcon col="status" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                  Created <SortIcon col="created_at" />
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((o) => (
                <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(o.id)}
                      onChange={() => toggleSel(o.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{o.customer_label}</td>
                  <td className="p-3">{o.sample_type || '—'}</td>
                  <td className="p-3">{o.plate_name || '—'}</td>
                  <td className="p-3 capitalize">{o.status || 'pending'}</td>
                  <td className="p-3 text-gray-500">{formatDate(o.created_at)}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={() => openEdit(o)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <p className="p-8 text-center text-gray-500">No orders match filters.</p>
          )}
        </div>

        <aside className="lg:w-80 shrink-0 space-y-4">
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Status history</h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto text-sm">
              {events.slice(0, 40).map((ev) => (
                <div key={ev.id} className="border-b border-gray-200 pb-2">
                  <p className="text-xs text-gray-500">{formatDate(ev.created_at)}</p>
                  <p>
                    {(ev.old_status || '—')} → <strong>{ev.new_status}</strong>
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    {ev.dna_orders?.sample_type || 'Order'} · {ev.dna_orders?.plate_name || '—'}
                  </p>
                </div>
              ))}
              {events.length === 0 && <p className="text-gray-500">No events yet.</p>}
            </div>
          </div>
        </aside>
      </div>

      {editOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold">Edit order</h3>
            <p className="text-sm text-gray-600">{editOrder.customer_label}</p>
            <label className="block text-sm">
              <span className="text-gray-600">Status</span>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-gray-600">Internal notes</span>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[100px]"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setEditOrder(null)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#003262] text-[#FDB515] font-medium disabled:opacity-50"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
