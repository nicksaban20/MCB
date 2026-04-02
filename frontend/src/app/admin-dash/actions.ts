'use server'

import { createClient } from '@/utils/supabase/server'

export async function updateOrderStatus(orderId: string, status: string) {
  const validStatuses = ['pending', 'in_progress', 'completed']
  if (!validStatuses.includes(status)) {
    return { error: `Invalid status: ${status}` }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('dna_orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order status:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function updateOrderNotes(orderId: string, notes: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('dna_orders')
    .update({ notes })
    .eq('id', orderId)

  if (error) {
    console.error('Error updating order notes:', error)
    return { error: error.message }
  }

  return { success: true }
}
