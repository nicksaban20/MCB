'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Navbar from '@/components/Navbar'
import { ToastProvider } from '@/components/Toast'

const links = [
  { href: '/admin', label: 'Orders' },
  { href: '/admin/samples', label: 'Samples' },
  { href: '/admin/plates', label: 'Plates' },
  { href: '/admin/queue', label: 'Queue' },
  { href: '/admin/results', label: 'Results' },
  { href: '/admin/analytics', label: 'Analytics' },
] as const

export default function AdminShell({
  children,
  user,
  avatarUrl,
}: {
  children: React.ReactNode
  user: User
  avatarUrl: string
}) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar profilePicUrl={avatarUrl} user={user} />
        <div className="flex pt-[74px]">
          <aside className="hidden md:block w-52 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-74px)] p-4 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
              Lab admin
            </p>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(l.href) ? 'bg-[#003262] text-[#FDB515]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </aside>
          <div className="flex-1 overflow-auto p-4 md:p-8 w-full min-w-0">
            <nav className="md:hidden flex flex-wrap gap-2 mb-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-xs px-2 py-1 rounded border ${
                    isActive(l.href)
                      ? 'bg-[#003262] text-[#FDB515] border-[#003262]'
                      : 'bg-white border-gray-200 text-[#003262]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            {children}
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}
