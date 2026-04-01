'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaDownload, FaPlus, FaTrash } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import { wellIndexToLabel } from '@/lib/plate-utils'
import { useToast } from '@/components/Toast'
import ConfirmDialog from '@/components/ConfirmDialog'

type Plate = { id: string; name: string; status: string; created_at: string }

type SampleRow = {
  id: string
  name: string | null
  plate_id: string | null
  well_index: number | null
  dna_orders?: { sample_type?: string; plate_name?: string }
}

export default function AdminPlatesPage() {
  const { addToast } = useToast()
  const [currentPlates, setCurrentPlates] = useState<Plate[]>([])
  const [pastPlates, setPastPlates] = useState<Plate[]>([])
  const [activePlate, setActivePlate] = useState<Plate | null>(null)
  const [plateSamples, setPlateSamples] = useState<SampleRow[]>([])
  const [unassignedSamples, setUnassignedSamples] = useState<SampleRow[]>([])
  const [openCurrent, setOpenCurrent] = useState(true)
  const [openPast, setOpenPast] = useState(false)
  const [newPlateName, setNewPlateName] = useState('')
  const [dragSampleId, setDragSampleId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)

  const loadPlates = useCallback(async () => {
    const [cur, past] = await Promise.all([
      fetch('/api/admin/plates?view=current'),
      fetch('/api/admin/plates?view=past'),
    ])
    if (cur.ok) setCurrentPlates(await cur.json())
    if (past.ok) setPastPlates(await past.json())
  }, [])

  const loadSamples = useCallback(async () => {
    const unassignedRes = await fetch('/api/admin/samples?plateId=unassigned')
    if (unassignedRes.ok) setUnassignedSamples(await unassignedRes.json())

    if (activePlate) {
      const plateRes = await fetch(`/api/admin/samples?plateId=${activePlate.id}`)
      if (plateRes.ok) setPlateSamples(await plateRes.json())
    } else {
      setPlateSamples([])
    }
  }, [activePlate])

  useEffect(() => {
    loadPlates()
  }, [loadPlates])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  useEffect(() => {
    if (!activePlate && currentPlates.length > 0) setActivePlate(currentPlates[0])
  }, [currentPlates, activePlate])

  const onPlate = useMemo(() => {
    const m = new Map<number, SampleRow>()
    for (const s of plateSamples) {
      if (s.well_index != null) {
        m.set(s.well_index, s)
      }
    }
    return m
  }, [plateSamples])

  const createPlate = async () => {
    const name = newPlateName.trim() || `Plate ${new Date().toISOString().slice(0, 10)}`
    const r = await fetch('/api/admin/plates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'preparing' }),
    })
    if (!r.ok) addToast((await r.json()).error || 'Failed', 'error')
    else {
      addToast(`Plate "${name}" created`, 'success')
      setNewPlateName('')
      const p = await r.json()
      await loadPlates()
      setActivePlate(p)
    }
  }

  const updatePlateStatus = async (status: string) => {
    if (!activePlate) return
    if (status === 'completed') {
      setConfirmComplete(true)
      return
    }
    await doUpdatePlateStatus(status)
  }

  const doUpdatePlateStatus = async (status: string) => {
    if (!activePlate) return
    const r = await fetch(`/api/admin/plates/${activePlate.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!r.ok) addToast((await r.json()).error || 'Failed', 'error')
    else {
      addToast(`Plate status updated to ${status}`, 'success')
      await loadPlates()
      setActivePlate({ ...activePlate, status })
    }
  }

  const deletePlate = async () => {
    if (!activePlate) return
    const r = await fetch(`/api/admin/plates/${activePlate.id}`, {
      method: 'DELETE',
    })
    if (!r.ok) addToast((await r.json()).error || 'Delete failed', 'error')
    else {
      addToast(`Plate "${activePlate.name}" deleted`, 'success')
      setActivePlate(null)
      loadPlates()
    }
  }

  const assignWell = async (wellIndex: number, sampleId: string | null) => {
    if (!activePlate) return
    if (sampleId === null) {
      const occupant = onPlate.get(wellIndex)
      if (occupant) {
        await fetch(`/api/admin/samples/${occupant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plate_id: null, well_index: null }),
        })
      }
      await loadSamples()
      return
    }
    const r = await fetch(`/api/admin/plates/${activePlate.id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_id: sampleId, well_index: wellIndex }),
    })
    if (!r.ok) addToast((await r.json()).error || 'Assign failed', 'error')
    await loadSamples()
  }

  const exportCsv = () => {
    if (!activePlate) return
    const lines = ['well,sample_id,name,sample_type']
    for (let i = 0; i < 96; i++) {
      const s = onPlate.get(i)
      lines.push(
        [wellIndexToLabel(i), s?.id || '', s?.name || '', s?.dna_orders?.sample_type || ''].join(',')
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${activePlate.name.replace(/\s+/g, '_')}_layout.csv`
    a.click()
  }

  const exportPdf = () => {
    if (!activePlate) return
    const doc = new jsPDF({ unit: 'pt', format: 'letter' })
    doc.setFontSize(14)
    doc.text(`Plate layout: ${activePlate.name} (${activePlate.status})`, 40, 48)
    doc.setFontSize(8)
    let x = 40
    let y = 72
    for (let i = 0; i < 96; i++) {
      const s = onPlate.get(i)
      const label = wellIndexToLabel(i)
      doc.text(`${label}: ${s?.name || '—'}`, x, y)
      y += 12
      if (y > 720) {
        y = 72
        x += 120
      }
    }
    doc.save(`${activePlate.name.replace(/\s+/g, '_')}_layout.pdf`)
  }

  const hasAssignedSamples = plateSamples.length > 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">96-well plate management</h1>
      <p className="text-gray-600 text-sm">Persisted plates — drag samples onto wells (or click well then sample).</p>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete plate"
        message={
          hasAssignedSamples
            ? `Plate "${activePlate?.name}" has ${plateSamples.length} assigned sample(s). They will be unassigned. Continue?`
            : `Delete plate "${activePlate?.name}"?`
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setConfirmDelete(false)
          deletePlate()
        }}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={confirmComplete}
        title="Mark plate as completed"
        message={`Mark plate "${activePlate?.name}" as completed? This is typically done after a sequencing run.`}
        confirmLabel="Complete"
        onConfirm={() => {
          setConfirmComplete(false)
          doUpdatePlateStatus('completed')
        }}
        onCancel={() => setConfirmComplete(false)}
      />

      <div className="flex flex-col lg:flex-row gap-4 min-h-[70vh]">
        <aside className="lg:w-72 shrink-0 bg-gray-50 border rounded-xl p-4 space-y-4">
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm"
              placeholder="New plate name"
              value={newPlateName}
              onChange={(e) => setNewPlateName(e.target.value)}
            />
            <button type="button" className="p-2 bg-blue-600 text-white rounded" onClick={createPlate} title="Add plate">
              <FaPlus />
            </button>
          </div>

          <div>
            <button
              type="button"
              className="w-full flex justify-between items-center py-2 font-medium"
              onClick={() => setOpenCurrent(!openCurrent)}
            >
              Current plates
              {openCurrent ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openCurrent && (
              <ul className="space-y-1 mt-2">
                {currentPlates.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActivePlate(p)}
                      className={`w-full text-left px-2 py-2 rounded text-sm ${
                        activePlate?.id === p.id ? 'bg-[#003262] text-[#FDB515]' : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      {p.name}{' '}
                      <span className="opacity-75 text-xs">({p.status})</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <button
              type="button"
              className="w-full flex justify-between items-center py-2 font-medium"
              onClick={() => setOpenPast(!openPast)}
            >
              Past plates
              {openPast ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openPast && (
              <ul className="space-y-1 mt-2 max-h-48 overflow-y-auto">
                {pastPlates.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setActivePlate(p)}
                      className={`w-full text-left px-2 py-2 rounded text-sm bg-white hover:bg-gray-100 ${
                        activePlate?.id === p.id ? 'ring-2 ring-[#003262]' : ''
                      }`}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <div className="flex-1 space-y-4 min-w-0">
          {activePlate && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">{activePlate.name}</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={activePlate.status}
                onChange={(e) => updatePlateStatus(e.target.value)}
              >
                {['preparing', 'loaded', 'running', 'completed'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="button" className="text-sm px-3 py-1 border rounded bg-white flex items-center gap-1" onClick={exportCsv}>
                <FaDownload className="text-xs" /> CSV
              </button>
              <button type="button" className="text-sm px-3 py-1 border rounded bg-white flex items-center gap-1" onClick={exportPdf}>
                <FaDownload className="text-xs" /> PDF
              </button>
              <button
                type="button"
                className="text-sm px-3 py-1 border border-red-300 rounded bg-white text-red-600 flex items-center gap-1 hover:bg-red-50"
                onClick={() => setConfirmDelete(true)}
              >
                <FaTrash className="text-xs" /> Delete
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border shadow-sm overflow-x-auto">
            <div className="inline-block">
              <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
                  {Array.from({ length: 96 }, (_, idx) => {
                  const s = onPlate.get(idx)
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <button
                        type="button"
                        title={wellIndexToLabel(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (dragSampleId) void assignWell(idx, dragSampleId)
                          setDragSampleId(null)
                        }}
                        onClick={(e) => {
                          if (e.detail === 2 && onPlate.get(idx)) {
                            void assignWell(idx, null)
                            return
                          }
                          if (dragSampleId) void assignWell(idx, dragSampleId)
                          setDragSampleId(null)
                        }}
                        className={`w-7 h-7 rounded-full text-[10px] font-mono flex items-center justify-center border ${
                          s ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-200 border-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        {wellIndexToLabel(idx)}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Drag a sample from the list onto a well. Click a filled well with a selected sample to replace, or use context: select sample then click empty well.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border">
            <h3 className="font-semibold mb-2">Samples (drag to plate)</h3>
            <ul className="space-y-2 max-h-56 overflow-y-auto text-sm">
              {unassignedSamples.map((s) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => setDragSampleId(s.id)}
                  onDragEnd={() => setDragSampleId(null)}
                  className={`p-2 rounded border cursor-grab active:cursor-grabbing ${
                    dragSampleId === s.id ? 'ring-2 ring-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{s.name || s.id.slice(0, 8)}</span>
                  <span className="text-gray-500 ml-2">{s.dna_orders?.sample_type}</span>
                </li>
              ))}
            </ul>
            {unassignedSamples.length === 0 && <p className="text-gray-500 text-sm">No unassigned samples.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
