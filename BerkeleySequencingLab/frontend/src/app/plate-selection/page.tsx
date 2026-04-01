'use client'

import React, { useEffect, useState } from "react"
import {
  FaChevronDown,
  FaChevronUp,
  FaEllipsisV,
  FaPlus,
  FaDownload,
} from "react-icons/fa"
import type { User } from '@supabase/supabase-js'
import Navbar from "../navbar/page"
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type PlateStatus = 'preparing' | 'loaded' | 'running' | 'completed'

type PlateWell = {
  id?: string
  well: string
  sample_id: string | null
  order_id: string | null
  notes: string | null
  created_at?: string | null
}

type PlateRecord = {
  id: string
  name: string
  status: PlateStatus
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  plate_wells: PlateWell[]
}

type SampleOrder = {
  id: string
  user_id: string
  sample_type: string | null
  status: string | null
  created_at: string | null
}

type SampleRecord = {
  id: string
  dna_order_id: string
  sample_no: string | null
  name: string | null
  notes: string | null
  created_at: string | null
  dna_orders: SampleOrder
}

type SampleGroup = {
  orderId: string
  label: string
  sampleType: string
  count: number
  colorClass: string
}

const COLOR_CLASSES = [
  'bg-green-500',
  'bg-purple-400',
  'bg-yellow-400',
  'bg-red-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
]

const EMPTY_WELL_CLASS = 'bg-gray-400'
const WELL_COUNT = 96

function getWellName(index: number) {
  const row = Math.floor(index / 12)
  const column = (index % 12) + 1
  return `${String.fromCharCode(65 + row)}${column}`
}

function groupSamples(samples: SampleRecord[]) {
  const grouped = new Map<string, SampleGroup>()

  samples.forEach((sample, index) => {
    const orderId = sample.dna_order_id

    if (!grouped.has(orderId)) {
      const shortId = orderId.slice(0, 8)
      grouped.set(orderId, {
        orderId,
        label: sample.dna_orders?.sample_type
          ? `${sample.dna_orders.sample_type} (${shortId})`
          : `Order ${shortId}`,
        sampleType: sample.dna_orders?.sample_type || 'Unknown Sample Type',
        count: 0,
        colorClass: COLOR_CLASSES[index % COLOR_CLASSES.length],
      })
    }

    grouped.get(orderId)!.count += 1
  })

  return Array.from(grouped.values())
}

export default function Dashboard() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [openCurrent, setOpenCurrent] = useState(true)
  const [openPast, setOpenPast] = useState(false)
  const [plates, setPlates] = useState<PlateRecord[]>([])
  const [sampleGroups, setSampleGroups] = useState<SampleGroup[]>([])
  const [activePlateId, setActivePlateId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plateStatus, setPlateStatus] = useState<PlateStatus>('preparing')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [wellAssignments, setWellAssignments] = useState<Record<string, PlateWell>>({})

  const currentPlates = plates.filter((plate) => plate.status !== 'completed')
  const pastPlates = plates.filter((plate) => plate.status === 'completed')
  const activePlate = plates.find((plate) => plate.id === activePlateId) ?? null

  const colorMap = sampleGroups.reduce<Record<string, string>>((map, group) => {
    map[group.orderId] = group.colorClass
    return map
  }, {})

  const wellColors = Array.from({ length: WELL_COUNT }, (_, index) => {
    const wellName = getWellName(index)
    const assignment = wellAssignments[wellName]
    return assignment?.order_id ? colorMap[assignment.order_id] || EMPTY_WELL_CLASS : EMPTY_WELL_CLASS
  })

  useEffect(() => {
    if (activePlate) {
      const nextAssignments = activePlate.plate_wells.reduce<Record<string, PlateWell>>((map, well) => {
        map[well.well] = {
          well: well.well,
          sample_id: well.sample_id,
          order_id: well.order_id,
          notes: well.notes,
          id: well.id,
          created_at: well.created_at,
        }
        return map
      }, {})

      setWellAssignments(nextAssignments)
      setPlateStatus(activePlate.status)
    } else {
      setWellAssignments({})
      setPlateStatus('preparing')
    }
  }, [activePlate])

  async function loadPlateData() {
    const [plateResponse, sampleResponse] = await Promise.all([
      fetch('/api/plates'),
      fetch('/api/samples'),
    ])

    const plateData = await plateResponse.json()
    const sampleData = await sampleResponse.json()

    if (!plateResponse.ok) {
      throw new Error(plateData?.details || plateData?.error || 'Failed to load plates')
    }

    if (!sampleResponse.ok) {
      throw new Error(sampleData?.details || sampleData?.error || 'Failed to load samples')
    }

    const nextPlates = (plateData ?? []) as PlateRecord[]
    const nextSampleGroups = groupSamples((sampleData ?? []) as SampleRecord[])

    setPlates(nextPlates)
    setSampleGroups(nextSampleGroups)
    setActivePlateId((currentId) => currentId ?? nextPlates[0]?.id ?? null)
  }

  function toggleGroup(orderId: string) {
    setSelectedGroupId((prev) => (prev === orderId ? null : orderId))
  }

  function paintWell(idx: number) {
    const wellName = getWellName(idx)

    setWellAssignments((prev) => {
      const next = { ...prev }

      if (!selectedGroupId) {
        delete next[wellName]
        return next
      }

      next[wellName] = {
        ...(next[wellName] ?? { sample_id: null, notes: null }),
        well: wellName,
        sample_id: null,
        order_id: selectedGroupId,
        notes: next[wellName]?.notes ?? null,
      }

      return next
    })
  }

  async function handleAddPlate() {
    const nextPlateName = window.prompt('Enter a new plate name')

    if (!nextPlateName) {
      return
    }

    try {
      setError(null)
      setMessage(null)

      const response = await fetch('/api/plates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nextPlateName,
          status: 'preparing',
          wells: [],
        }),
      })

      const responseBody = await response.json()

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to create plate')
      }

      await loadPlateData()
      setMessage('New plate created successfully.')
      if (responseBody?.plateId) {
        setActivePlateId(responseBody.plateId)
      }
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unknown error')
    }
  }

  async function handleSavePlate() {
    if (!activePlate) {
      setError('Please create a plate first.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setMessage(null)

      const response = await fetch('/api/plates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: activePlate.id,
          name: activePlate.name,
          status: plateStatus,
          wells: Object.values(wellAssignments),
        }),
      })

      const responseBody = await response.json()

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to save plate layout')
      }

      await loadPlateData()
      setMessage('Plate layout saved successfully.')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setError(null)

        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError) {
          console.error('Plate selection auth lookup failed:', userError)
          router.replace('/unauthorized?reason=auth')
          return
        }

        const currentUser = userData.user
        setUser(currentUser ?? null)

        if (!currentUser) {
          router.replace('/unauthorized?reason=auth')
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (profileError) {
          console.error('Plate selection role lookup failed:', profileError)
          router.replace('/unauthorized?reason=role')
          return
        }

        const role = profile?.role
        const isStaff = role === 'staff' || role === 'superadmin'

        if (!isStaff) {
          router.replace('/unauthorized?reason=admin')
          return
        }

        await loadPlateData()
        setLoading(false)
      } catch (loadError) {
        console.error('Plate selection failed to load:', loadError)
        setError(loadError instanceof Error ? loadError.message : 'Unknown error')
        setLoading(false)
      }
    }

    checkAccess()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Checking access...</p>
      </div>
    )
  }

  if (error && !activePlate && plates.length === 0) {
    return (
      <>
        <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <p className="text-lg text-red-600">Error loading plate data: {error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="flex h-screen bg-gray-100">
        <aside className="w-1/4 bg-gray-50 border-r p-4 space-y-6 text-gray-800">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plate Selection</h3>
            <button
              onClick={handleAddPlate}
              className="flex items-center text-sm px-2 py-1 border rounded hover:bg-gray-200"
            >
              <FaPlus className="mr-1" /> Add new plate
            </button>
          </div>

          <div>
            <button
              className="w-full flex justify-between items-center py-2 hover:bg-gray-200 rounded"
              onClick={() => setOpenCurrent(!openCurrent)}
            >
              <span className="font-medium">Current Plates</span>
              {openCurrent ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openCurrent && (
              <ul className="mt-2 space-y-2">
                {currentPlates.length > 0 ? currentPlates.map((plate) => (
                  <li key={plate.id}>
                    <label className="flex items-center space-x-2 bg-white p-2 rounded hover:bg-gray-100">
                      <input
                        type="radio"
                        name="plate"
                        checked={activePlateId === plate.id}
                        onChange={() => setActivePlateId(plate.id)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span>{plate.name}</span>
                    </label>
                  </li>
                )) : (
                  <li className="rounded bg-white p-3 text-sm text-gray-500">No current plates yet.</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <button
              className="w-full flex justify-between items-center py-2 hover:bg-gray-200 rounded"
              onClick={() => setOpenPast(!openPast)}
            >
              <span className="font-medium">Past Finished Plates</span>
              {openPast ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {openPast && (
              <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {pastPlates.length > 0 ? pastPlates.map((plate) => (
                  <li key={plate.id}>
                    <label className="flex items-center space-x-2 bg-white p-2 rounded hover:bg-gray-100">
                      <input
                        type="radio"
                        name="platePast"
                        checked={activePlateId === plate.id}
                        onChange={() => setActivePlateId(plate.id)}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span>{plate.name}</span>
                    </label>
                  </li>
                )) : (
                  <li className="rounded bg-white p-3 text-sm text-gray-500">No completed plates yet.</li>
                )}
              </ul>
            )}
          </div>
        </aside>

        <div className="flex-1 p-6 space-y-8">
          {message && (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="bg-white p-6 rounded shadow">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h4 className="text-lg font-semibold">{activePlate?.name || 'No plate selected'}</h4>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Status</label>
                <select
                  value={plateStatus}
                  onChange={(event) => setPlateStatus(event.target.value as PlateStatus)}
                  disabled={!activePlate}
                  className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  <option value="preparing">preparing</option>
                  <option value="loaded">loaded</option>
                  <option value="running">running</option>
                  <option value="completed">completed</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <div className="bg-gray-200 p-2 rounded">
                <div className="grid grid-cols-12 gap-1">
                  {wellColors.map((colorClass, idx) => (
                    <div
                      key={getWellName(idx)}
                      className={`w-6 h-6 rounded-full ${colorClass} cursor-pointer`}
                      onClick={() => paintWell(idx)}
                      title={getWellName(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Customer / Samples</h4>
              <span className="text-sm text-gray-500">Select an order, then click wells to assign it.</span>
            </div>
            <ul className="space-y-2 overflow-y-auto max-h-64">
              {sampleGroups.length > 0 ? sampleGroups.map((group) => (
                <li
                  key={group.orderId}
                  className={`bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer
                    ${selectedGroupId === group.orderId ? "ring-2 ring-blue-600" : ""}
                  `}
                  onClick={() => toggleGroup(group.orderId)}
                >
                  <div className="flex items-center">
                    <div className={`${group.colorClass} w-2 h-12 rounded-l-lg`} />
                    <div className="ml-4">
                      <p className="font-semibold text-gray-800">{group.label}</p>
                      <p className="text-sm text-gray-600">
                        {group.count} Samples
                      </p>
                    </div>
                  </div>
                  <FaEllipsisV className="text-gray-500 ml-2" />
                </li>
              )) : (
                <li className="rounded bg-gray-50 p-4 text-sm text-gray-500">
                  No sample groups available yet.
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSavePlate}
              disabled={!activePlate || saving}
              className="flex items-center text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <FaDownload className="mr-2" /> {saving ? 'Saving...' : 'Save Plate Layout'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
