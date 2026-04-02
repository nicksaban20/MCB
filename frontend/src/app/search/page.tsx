'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../navbar/page'
import Link from 'next/link'

type SearchResult = {
  type: 'order' | 'sample' | 'page'
  title: string
  description: string
  link: string
}

const STATIC_PAGES: SearchResult[] = [
  { type: 'page', title: 'Order Form', description: 'Submit a new sequencing order', link: '/form' },
  { type: 'page', title: 'FAQ', description: 'Frequently asked questions about our services', link: '/faq' },
  { type: 'page', title: 'Calendar', description: 'Lab hours, holidays, and deadlines', link: '/calendar' },
  { type: 'page', title: 'Sample Guidelines', description: 'DNA concentration, volume, and preparation requirements', link: '/sample-guidelines' },
  { type: 'page', title: 'Results Interpretation Guide', description: 'How to read chromatograms and quality scores', link: '/results-guide' },
  { type: 'page', title: 'Terms and Conditions', description: 'Lab policies and data retention', link: '/terms' },
  { type: 'page', title: 'Useful Links', description: 'BLAST, SnapGene, Benchling, and other resources', link: '/links' },
  { type: 'page', title: 'Contact / Feedback', description: 'Send a message to the sequencing facility', link: '/contact' },
  { type: 'page', title: 'Profile', description: 'Manage your account and password', link: '/profile' },
  { type: 'page', title: 'Dashboard', description: 'View your orders and updates', link: '/dashboard' },
  { type: 'page', title: 'Admin Dashboard', description: 'Manage orders and lab operations', link: '/admin-dash' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const q = query.toLowerCase()
    const found: SearchResult[] = []

    // Search static pages
    STATIC_PAGES.forEach(page => {
      if (page.title.toLowerCase().includes(q) || page.description.toLowerCase().includes(q)) {
        found.push(page)
      }
    })

    // Search orders
    try {
      const { data: orders } = await supabase
        .from('dna_orders')
        .select('id, sample_type, dna_type, plate_name, status, created_at')
        .or(`sample_type.ilike.%${q}%,dna_type.ilike.%${q}%,plate_name.ilike.%${q}%`)
        .limit(10)

      if (orders) {
        orders.forEach(order => {
          found.push({
            type: 'order',
            title: `Order #${order.id}`,
            description: `${order.sample_type || 'Unknown type'} — ${order.status || 'pending'} — ${new Date(order.created_at).toLocaleDateString()}`,
            link: '/dashboard',
          })
        })
      }
    } catch {
      // User may not be authenticated
    }

    // Search samples
    try {
      const { data: samples } = await supabase
        .from('dna_samples')
        .select('id, sample_no, name, notes, dna_order_id')
        .or(`name.ilike.%${q}%,sample_no.ilike.%${q}%,notes.ilike.%${q}%`)
        .limit(10)

      if (samples) {
        samples.forEach(sample => {
          found.push({
            type: 'sample',
            title: sample.name || `Sample ${sample.sample_no}`,
            description: `Order #${sample.dna_order_id} — ${sample.notes || 'No notes'}`,
            link: '/dashboard',
          })
        })
      }
    } catch {
      // User may not be authenticated
    }

    setResults(found)
    setLoading(false)
  }

  const badgeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800'
      case 'sample': return 'bg-green-100 text-green-800'
      case 'page': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar profilePicUrl="" user={null} />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search</h1>

        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search orders, samples, pages..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-[#003262] text-white rounded-lg hover:bg-[#00254a] transition"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searched && results.length === 0 && !loading && (
          <p className="text-gray-500">No results found for "{query}"</p>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((r, i) => (
              <Link key={i} href={r.link}>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor(r.type)}`}>
                      {r.type}
                    </span>
                    <span className="font-semibold text-gray-800">{r.title}</span>
                  </div>
                  <p className="text-sm text-gray-500">{r.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!searched && (
          <div className="text-gray-400 text-sm">
            <p>Search across orders, samples, and site pages.</p>
          </div>
        )}
      </div>
    </div>
  )
}
