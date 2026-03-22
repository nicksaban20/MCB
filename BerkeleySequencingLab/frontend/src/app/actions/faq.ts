'use server'

import { createClient } from '@/utils/supabase/server'
import type { FAQEntry } from '@/types'

export async function getFAQEntries(): Promise<{ data: FAQEntry[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_entries')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function getAllFAQEntries(): Promise<{ data: FAQEntry[] | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faq_entries')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createFAQEntry(entry: Omit<FAQEntry, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('faq_entries')
    .insert([entry])

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function updateFAQEntry(id: string, updates: Partial<FAQEntry>): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('faq_entries')
    .update(updates)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}

export async function deleteFAQEntry(id: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('faq_entries')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}
