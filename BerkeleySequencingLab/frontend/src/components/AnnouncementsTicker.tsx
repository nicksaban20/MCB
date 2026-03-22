'use client'

import { useState, useEffect } from 'react'
import { getActiveAnnouncements } from '@/app/actions/announcements'
import type { Announcement } from '@/types'

export default function AnnouncementsTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed] = useState(false)
  const [minimized, setMinimized] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ticker_dismissed')
    if (stored === 'true') setMinimized(true)

    const fetchAnnouncements = async () => {
      const { data } = await getActiveAnnouncements()
      if (data && data.length > 0) setAnnouncements(data)
    }
    fetchAnnouncements()
  }, [])

  if (dismissed || announcements.length === 0) return null

  if (minimized) {
    return (
      <div className="fixed top-[74px] right-4 z-40">
        <button
          onClick={() => {
            setMinimized(false)
            localStorage.removeItem('ticker_dismissed')
          }}
          className="bg-[#003262] text-[#FDB515] px-3 py-1 rounded-b-lg text-xs font-medium shadow-md hover:bg-[#00204a] transition"
        >
          Show Announcements
        </button>
      </div>
    )
  }

  const tickerText = announcements.map(a => a.title + ': ' + a.content).join('  \u2022  ')

  return (
    <div className="fixed top-[74px] left-0 right-0 z-40 bg-[#003262] text-[#FDB515] overflow-hidden">
      <div className="flex items-center h-8">
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap inline-block">
            <span className="text-sm font-medium px-4">{tickerText}</span>
            <span className="text-sm font-medium px-4">{tickerText}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setMinimized(true)
            localStorage.setItem('ticker_dismissed', 'true')
          }}
          className="px-3 text-[#FDB515] hover:text-white transition text-lg font-bold shrink-0"
          aria-label="Dismiss announcements"
        >
          &times;
        </button>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
