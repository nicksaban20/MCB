'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { ORDER_STATUSES } from '@/lib/order-lifecycle'
import { useToast } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

type OrderRow = {
  id: string
  status: string | null
  sample_type: string | null
  plate_name: string | null
  created_at: string
  customer_label?: string
}

type SortKey = 'customer_label' | 'sample_type' | 'plate_name' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

export default function AdminQueuePage() {
  const { addToast } = useToast()
  const [rows, setRows] = useState<OrderRow[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBatch, setConfirmBatch] = useState<string | null>(null)
  const [confirmPlateRun, setConfirmPlateRun] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/orders')
    if (r.ok) {
      const list: OrderRow[] = await r.json()
      setRows(
        list.filter((o) => ['pending', 'in_progress'].includes((o.status || 'pending').toLowerCase()))
      )
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = String(a[sortKey] || '').toLowerCase()
      const bv = String(b[sortKey] || '').toLowerCase()
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (sortDir === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />) : null

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s)
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

  const batch = async (status: string) => {
    if (selected.size === 0) return
    const res = await fetch('/api/admin/orders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [...selected], status }),
    })
    if (!res.ok) addToast((await res.json()).error || 'Failed', 'error')
    else {
      addToast(`${selected.size} order(s) set to ${status.replace('_', ' ')}`, 'success')
      setSelected(new Set())
      load()
    }
  }

  const completePlateRun = async () => {
    const r = await fetch('/api/admin/plates?view=running')
    if (!r.ok) return
    const running = await r.json()
    if (!running.length) {
      addToast('No plates in "running" status. Change a plate to running on the Plates page first.', 'error')
      return
    }
    const plate = running[0]

    await fetch(`/api/admin/plates/${plate.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })

    const samplesRes = await fetch(`/api/admin/samples?plateId=${plate.id}`)
    if (samplesRes.ok) {
      const samples: { id: string; dna_order_id: string }[] = await samplesRes.json()
      const sampleIds = samples.map((s) => s.id)
      if (sampleIds.length) {
        await fetch('/api/admin/samples/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: sampleIds, status: 'completed' }),
        })
      }

      const orderIds = [...new Set(samples.map((s) => s.dna_order_id))]
      for (const oid of orderIds) {
        const oSamplesRes = await fetch(`/api/admin/samples?orderId=${oid}`)
        if (!oSamplesRes.ok) continue
        const oSamples: { status: string | null }[] = await oSamplesRes.json()
        const allCompleted = oSamples.every((s) => (s.status || '').toLowerCase() === 'completed')
        if (allCompleted) {
          await fetch('/api/admin/orders/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [oid], status: 'completed' }),
          })
        }
      }
    }

    addToast(`Plate "${plate.name}" completed. Samples and qualifying orders updated.`, 'success')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Processing queue</h1>
          <p className="text-gray-600 text-sm mt-1">Pending and in-progress orders — batch promote and link to plates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/plates" className="px-3 py-2 rounded-lg border bg-white text-sm">
            Open plates
          </Link>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-[#003262] text-[#FDB515] text-sm"
            onClick={() => setConfirmPlateRun(true)}
          >
            Complete a plate run
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmPlateRun}
        title="Complete plate run"
        message="This will mark the first running plate as completed, set all its samples to completed, and auto-complete any fully-finished orders. Continue?"
        confirmLabel="Complete run"
        destructive
        onConfirm={() => {
          setConfirmPlateRun(false)
          completePlateRun()
        }}
        onCancel={() => setConfirmPlateRun(false)}
      />

      <ConfirmDialog
        open={!!confirmBatch}
        title="Confirm batch status change"
        message={`Set ${selected.size} order(s) to "${confirmBatch?.replace('_', ' ')}"?`}
        confirmLabel="Update"
        onConfirm={() => {
          if (confirmBatch) batch(confirmBatch)
          setConfirmBatch(null)
        }}
        onCancel={() => setConfirmBatch(null)}
      />

      {selected.size > 0 && (
        <div className="flex flex-wrap gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <span className="text-sm">{selected.size} selected</span>
          {ORDER_STATUSES.filter((s) => s !== 'cancelled').map((s) => (
            <button
              key={s}
              type="button"
              className="text-xs px-2 py-1 rounded border bg-white capitalize"
              onClick={() => setConfirmBatch(s)}
            >
              Set {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 w-8">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('customer_label')}>
                Customer <SortIcon col="customer_label" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('sample_type')}>
                Type <SortIcon col="sample_type" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('plate_name')}>
                Plate name <SortIcon col="plate_name" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('status')}>
                Status <SortIcon col="status" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                Created <SortIcon col="created_at" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-2">
                  <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} />
                </td>
                <td className="p-2">{o.customer_label}</td>
                <td className="p-2">{o.sample_type}</td>
                <td className="p-2">{o.plate_name}</td>
                <td className="p-2 capitalize">{(o.status || 'pending').replace('_', ' ')}</td>
                <td className="p-2 text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-gray-500">Queue empty.</p>}
      </div>
    </div>
  )
}
