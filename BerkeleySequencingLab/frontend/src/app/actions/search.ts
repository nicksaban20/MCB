'use server'

import { createClient } from '@/utils/supabase/server'
import type { SearchResult } from '@/types'
import { staticPages } from '@/utils/searchIndex'

export async function searchAll(query: string, isAdmin: boolean): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const q = query.toLowerCase().trim()
  const results: SearchResult[] = []

  // Search static pages
  const pageResults = staticPages.filter(page =>
    page.title.toLowerCase().includes(q) ||
    page.description.toLowerCase().includes(q) ||
    page.keywords.some(kw => kw.toLowerCase().includes(q))
  ).map(page => ({
    type: 'page' as const,
    title: page.title,
    description: page.description,
    url: page.url,
    category: 'Pages',
  }))
  results.push(...pageResults)

  // Search FAQ entries
  const supabase = await createClient()
  const { data: faqResults } = await supabase
    .from('faq_entries')
    .select('*')
    .eq('is_published', true)
    .or(`question.ilike.%${q}%,answer.ilike.%${q}%`)
    .limit(10)

  if (faqResults) {
    results.push(...faqResults.map(faq => ({
      type: 'faq' as const,
      title: faq.question,
      description: faq.answer.substring(0, 150) + '...',
      url: '/faq',
      category: 'FAQ',
    })))
  }

  // Admin-only: search orders
  if (isAdmin) {
    const { data: orderResults } = await supabase
      .from('dna_orders')
      .select('*')
      .or(`sample_type.ilike.%${q}%,status.ilike.%${q}%,plate_name.ilike.%${q}%`)
      .limit(10)

    if (orderResults) {
      results.push(...orderResults.map(order => ({
        type: 'order' as const,
        title: `Order: ${order.sample_type || 'Unknown'}`,
        description: `Status: ${order.status} | Plate: ${order.plate_name || 'N/A'}`,
        url: '/admin-dash',
        category: 'Orders',
      })))
    }
  }

  return results
}
