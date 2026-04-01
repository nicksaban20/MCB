import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { searchParams } = new URL(req.url)
  const view = searchParams.get('view')

  let query = gate.supabase.from('plates').select('*').order('created_at', { ascending: false })

  if (view === 'current') {
    query = query.neq('status', 'completed')
  } else if (view === 'past') {
    query = query.eq('status', 'completed')
  } else if (view === 'running') {
    query = query.eq('status', 'running')
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 })
  }

  const status = typeof body.status === 'string' ? body.status : 'preparing'

  const { data, error } = await gate.supabase
    .from('plates')
    .insert({ name, status })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
