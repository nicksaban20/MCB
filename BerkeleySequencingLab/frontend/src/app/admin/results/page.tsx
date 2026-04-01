'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/Toast'

type ResultRow = {
  id: string
  file_name: string
  storage_path: string
  mime_type: string | null
  dna_order_id: string
  signedUrl?: string | null
  customer_label?: string
  dna_orders?: { sample_type?: string; plate_name?: string }
}

const BUCKET = 'sequencing-results'

type SortKey = 'file_name' | 'customer_label'
type SortDir = 'asc' | 'desc'

export default function AdminResultsPage() {
  const { addToast } = useToast()
  const [rows, setRows] = useState<ResultRow[]>([])
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [orderId, setOrderId] = useState('')
  const [debouncedOrderId, setDebouncedOrderId] = useState('')
  const [preview, setPreview] = useState<ResultRow | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadOrderId, setUploadOrderId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('file_name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const supabase = createClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const debounceRef2 = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(debounceRef.current)
  }, [q])

  useEffect(() => {
    clearTimeout(debounceRef2.current)
    debounceRef2.current = setTimeout(() => setDebouncedOrderId(orderId), 400)
    return () => clearTimeout(debounceRef2.current)
  }, [orderId])

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (debouncedOrderId.trim()) params.set('orderId', debouncedOrderId.trim())
    if (debouncedQ.trim()) params.set('q', debouncedQ.trim())
    const r = await fetch(`/api/admin/results?${params}`)
    if (r.ok) setRows(await r.json())
  }, [debouncedOrderId, debouncedQ])

  useEffect(() => {
    load()
  }, [load])

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600)
    return data?.signedUrl ?? null
  }

  const handleView = async (row: ResultRow) => {
    setPreview(row)
    setTextContent(null)
    setPreviewUrl(null)
    const url = await getSignedUrl(row.storage_path)
    setPreviewUrl(url)
    if (url) {
      const ext = row.file_name.toLowerCase()
      if (ext.endsWith('.txt') || ext.endsWith('.seq') || ext.endsWith('.fa') || ext.endsWith('.fasta')) {
        try {
          const r = await fetch(url)
          setTextContent(await r.text())
        } catch {
          setTextContent('Could not load text preview.')
        }
      }
    }
  }

  const handleDownload = async (row: ResultRow) => {
    const url = await getSignedUrl(row.storage_path)
    if (url) window.open(url, '_blank')
    else addToast('Could not generate download URL', 'error')
  }

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

  const registerUpload = async (storage_path: string, file_name: string, mime_type: string | null) => {
    const r = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dna_order_id: uploadOrderId,
        storage_path,
        file_name,
        mime_type,
      }),
    })
    if (!r.ok) addToast((await r.json()).error || 'Register failed', 'error')
    else {
      addToast('File uploaded and registered', 'success')
      setFile(null)
      load()
    }
  }

  const handleUpload = async () => {
    if (!uploadOrderId || !file) {
      addToast('Order ID and file required.', 'error')
      return
    }
    const path = `${uploadOrderId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) {
      addToast(`Upload failed: ${error.message}`, 'error')
      return
    }
    await registerUpload(path, file.name, file.type || null)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sequencing results</h1>
      <p className="text-gray-600 text-sm">
        Browse result files by customer or order. Text formats preview in-browser; `.ab1` / binary opens via signed download.
      </p>

      <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          Search
          <input className="block border rounded px-2 py-1 mt-1" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="text-sm">
          Order ID
          <input
            className="block border rounded px-2 py-1 mt-1 font-mono text-xs w-64"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>
      </div>

      <div className="bg-white p-4 rounded-xl border space-y-2">
        <h3 className="font-semibold">Register upload</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="text-sm">
            Order ID
            <input
              className="block border rounded px-2 py-1 mt-1 font-mono text-xs w-64"
              value={uploadOrderId}
              onChange={(e) => setUploadOrderId(e.target.value)}
            />
          </label>
          <label className="text-sm">
            File
            <input
              type="file"
              className="block mt-1 text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
          <button type="button" className="px-3 py-2 rounded border text-sm" onClick={handleUpload}>
            Upload to storage + register
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Bucket name: <code className="bg-gray-100 px-1">{BUCKET}</code> — create in Supabase Storage if missing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('file_name')}>
                  File <SortIcon col="file_name" />
                </th>
                <th className="p-2 cursor-pointer select-none" onClick={() => toggleSort('customer_label')}>
                  Customer <SortIcon col="customer_label" />
                </th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs">{r.file_name}</td>
                  <td className="p-2">{r.customer_label}</td>
                  <td className="p-2 space-x-2">
                    <button type="button" className="text-blue-600 text-xs" onClick={() => handleView(r)}>
                      View
                    </button>
                    <button type="button" className="text-blue-600 text-xs" onClick={() => handleDownload(r)}>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="p-4 text-gray-500 text-sm">No files match.</p>}
        </div>

        <div className="bg-gray-900 text-gray-100 rounded-xl p-4 min-h-[320px] text-sm">
          {preview ? (
            <>
              <p className="font-mono text-xs text-amber-300 mb-2">{preview.file_name}</p>
              {textContent != null ? (
                <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-[480px]">{textContent}</pre>
              ) : preview.file_name.toLowerCase().endsWith('.ab1') ? (
                <p className="text-gray-400">
                  ABIF trace: use Download and open in FinchTV / Chromas, or add a trace viewer dependency later.
                </p>
              ) : previewUrl ? (
                <p className="text-gray-400">Binary or unknown type — use Download.</p>
              ) : (
                <p className="text-gray-400">Generating signed URL…</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a file to preview.</p>
          )}
        </div>
      </div>
    </div>
  )
}
