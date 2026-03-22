'use server'

import { createClient } from '@/utils/supabase/server'
import type { CalendarEvent } from '@/types'

export async function getCalendarEvents(): Promise<{ data: CalendarEvent[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('start_date', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('calendar_events')
    .insert([event])

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('calendar_events')
    .update(updates)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function deleteCalendarEvent(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}
