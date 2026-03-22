'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../navbar/page'
import { createClient } from '@/utils/supabase/client'
import { searchAll } from '../actions/search'
import { isAdmin } from '@/utils/admin'
import type { SearchResult } from '@/types'
import { User } from '@supabase/supabase-js'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
      setLoading(false)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery)
    }
  }, [initialQuery, user])

  const performSearch = async (q: string) => {
    if (!q.trim()) return
    setSearching(true)
    const data = await searchAll(q, isAdmin(user))
    setResults(data)
    setSearching(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  // Group results by category
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = []
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, SearchResult[]>)

  if (loading) return null

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#003262] mb-6">Search Results</h1>

          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, FAQ, orders..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003262]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition"
              >
                Search
              </button>
            </div>
          </form>

          {searching && (
            <p className="text-gray-500">Searching...</p>
          )}

          {!searching && results.length === 0 && initialQuery && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No results found for &ldquo;{initialQuery}&rdquo;</p>
              <p className="text-gray-400 text-sm">Try different keywords or browse our pages:</p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <Link href="/faq" className="text-[#003262] underline text-sm">FAQ</Link>
                <Link href="/calendar" className="text-[#003262] underline text-sm">Calendar</Link>
                <Link href="/links" className="text-[#003262] underline text-sm">Links</Link>
                <Link href="/results-guide" className="text-[#003262] underline text-sm">Results Guide</Link>
              </div>
            </div>
          )}

          {!searching && Object.keys(grouped).length > 0 && (
            <div className="space-y-8">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-[#003262] mb-3 border-b border-gray-200 pb-2">{category}</h2>
                  <div className="space-y-3">
                    {items.map((result, idx) => (
                      <Link key={idx} href={result.url} className="block">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-[#003262] hover:shadow-sm transition">
                          <h3 className="font-medium text-[#003262]">{result.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                          <span className="text-xs text-gray-400 mt-1 inline-block">{result.url}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
