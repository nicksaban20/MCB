import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { data: orders, error: oErr } = await gate.supabase
    .from('dna_orders')
    .select('id, status, sample_type, created_at, completed_at, updated_at')

  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 })

  const list = orders || []

  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  let filtered = list
  if (fromParam) {
    const fromDate = new Date(fromParam).getTime()
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= fromDate)
  }
  if (toParam) {
    const toDate = new Date(toParam).getTime() + 86400000
    filtered = filtered.filter((o) => new Date(o.created_at).getTime() < toDate)
  }

  const volumeByDay: Record<string, number> = {}
  for (const o of filtered) {
    const k = dayKey(new Date(o.created_at))
    volumeByDay[k] = (volumeByDay[k] || 0) + 1
  }

  const sampleTypeDist: Record<string, number> = {}
  for (const o of filtered) {
    const t = o.sample_type || 'unknown'
    sampleTypeDist[t] = (sampleTypeDist[t] || 0) + 1
  }

  const completed = filtered.filter((o) => o.status === 'completed' && o.completed_at)
  let turnaroundSum = 0
  let turnaroundN = 0
  for (const o of completed) {
    const start = new Date(o.created_at).getTime()
    const end = new Date(o.completed_at as string).getTime()
    if (end > start) {
      turnaroundSum += (end - start) / (1000 * 60 * 60 * 24)
      turnaroundN += 1
    }
  }

  const { data: orgs } = await gate.supabase.from('organizations').select('user_id')
  const customerAccounts = new Set((orgs || []).map((r) => r.user_id)).size

  return NextResponse.json({
    orderVolumeByDay: Object.entries(volumeByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    sampleTypeDistribution: Object.entries(sampleTypeDist).map(([name, value]) => ({
      name,
      value,
    })),
    turnaroundDaysAvg: turnaroundN ? Math.round((turnaroundSum / turnaroundN) * 10) / 10 : null,
    totals: {
      orders: filtered.length,
      pending: filtered.filter((o) => o.status === 'pending').length,
      in_progress: filtered.filter((o) => o.status === 'in_progress').length,
      completed: filtered.filter((o) => o.status === 'completed').length,
      customersWithOrgProfile: customerAccounts,
    },
  })
}
