
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server' 

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dna_orders')
    .select('*')
    .order('created_at', { ascending: false })
  console.log({ data, error })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
