'use server'

import { createClient } from '@/utils/supabase/server'
import type { Announcement } from '@/types'

export async function getActiveAnnouncements(): Promise<{ data: Announcement[] | null; error: string | null }> {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .or(`end_date.is.null,end_date.gte.${now}`)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getAllAnnouncements(): Promise<{ data: Announcement[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .insert([announcement])

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}
