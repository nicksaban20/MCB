import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const { data, error } = await gate.supabase
    .from('order_status_events')
    .select(
      `
      *,
      dna_orders ( id, sample_type, plate_name, user_id )
    `
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}
