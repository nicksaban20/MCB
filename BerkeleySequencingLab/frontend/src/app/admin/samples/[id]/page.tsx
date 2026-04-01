'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/Toast'
import { SAMPLE_STATUSES } from '@/lib/order-lifecycle'

export default function AdminSampleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToast } = useToast()
  const id = params.id as string
  const [row, setRow] = useState<Record<string, unknown> | null>(null)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('pending')
  const [flag, setFlag] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await fetch(`/api/admin/samples/${id}`)
      if (!r.ok) return
      const found = await r.json()
      if (!cancelled && found) {
        setRow(found)
        setName(String(found.name || ''))
        setNotes(String(found.notes || ''))
        setStatus(String(found.status || 'pending'))
        setFlag(Boolean(found.flag_for_review))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      const r = await fetch(`/api/admin/samples/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, notes, status, flag_for_review: flag }),
      })
      if (!r.ok) throw new Error((await r.json()).error || 'Failed')
      router.push('/admin/samples')
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!row) return <p className="text-gray-600">Loading…</p>

  const order = row.dna_orders as { id?: string; sample_type?: string } | undefined

  return (
    <div className="max-w-xl space-y-4">
      <Link href="/admin/samples" className="text-sm text-blue-600 hover:underline">
        ← Samples
      </Link>
      <h1 className="text-2xl font-bold">Sample detail</h1>
      <p className="text-sm text-gray-600">Order: {order?.id?.slice(0, 8)} · {order?.sample_type}</p>
      <label className="block text-sm">
        Name
        <input className="mt-1 w-full border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm">
        Notes
        <textarea
          className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Status
        <select className="mt-1 w-full border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {SAMPLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
        Flag for review
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="px-4 py-2 rounded-lg bg-[#003262] text-[#FDB515] font-medium disabled:opacity-50"
      >
        Save
      </button>
    </div>
  )
}
