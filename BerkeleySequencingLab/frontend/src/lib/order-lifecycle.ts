/** Lab order status transitions (extend as needed). */
const ALLOWED: Record<string, string[]> = {
  pending: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['pending', 'completed', 'cancelled'],
  completed: ['in_progress'],
  cancelled: ['pending', 'in_progress'],
}

export function canTransitionOrderStatus(from: string | null | undefined, to: string): boolean {
  const a = (from || 'pending').toLowerCase()
  const b = to.toLowerCase()
  if (a === b) return true
  const next = ALLOWED[a]
  return Boolean(next?.includes(b))
}

export const ORDER_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const SAMPLE_STATUSES = ['pending', 'received', 'processing', 'completed', 'failed'] as const
export type SampleStatus = (typeof SAMPLE_STATUSES)[number]
