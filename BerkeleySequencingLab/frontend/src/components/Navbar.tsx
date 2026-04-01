'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const Navbar = ({
  profilePicUrl,
  user = null,
}: {
  profilePicUrl: string
  user?: User | null
}) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const isHero = pathname === '/hero'
  const isEvent = pathname.startsWith('/form')

  useEffect(() => {
    setIsAdmin(Boolean(user?.user_metadata?.is_admin || user?.app_metadata?.is_admin))
  }, [user])

  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (user) {
    const meta = user.user_metadata as { avatar_url?: string; picture?: string } | undefined
    return (
      <>
        <nav className="fixed inset-x-0 top-0 z-50 w-full bg-[#003262] px-4 transition-all duration-300">
          <div className="mx-auto flex max-w-8xl items-center justify-between py-3">
            <Link href={isHero ? '/hero' : '/dashboard'} className="shrink-0">
              <Image
                src="/assets/mcb_icon.png"
                alt="MCB logo"
                width={48}
                height={48}
                className="rounded-full border-2 border-white object-cover"
              />
            </Link>

            <div className="flex items-center gap-6">
              <ul className="flex gap-6 font-medium items-center uppercase text-sm">
                <li className="hover:font-bold">
                  <Link href="/hero" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                    HOME
                  </Link>
                </li>
                <li className="relative group">
                  <span className="hover:font-bold text-[#FDB515] cursor-pointer" style={{ color: '#FDB515' }}>
                    SERVICES
                  </span>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#003262] border border-[#FDB515] rounded-lg shadow-lg py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/cell-line" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">CELL LINE AUTHENTICATION</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">DNA FRAGMENT ANALYSIS</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">DNA NORMALIZATION</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">DNA QUANTIFICATION</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">OPEN ACCESS INSTRUMENTS</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">PCR REACTION CLEANUP</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">PLASMID & GENOMIC DNA</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">PLASMID SEQUENCING</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">SANGER SEQUENCING</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">STEM CELL AUTHENTICATION</Link>
                    <Link href="/dashboard" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">STOCK PRIMERS (FREE)</Link>
                  </div>
                </li>
                <li className="hover:font-bold">
                  <Link href="/form" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                    ORDER FORMS
                  </Link>
                </li>
                <li className="hover:font-bold">
                  <Link href="/dashboard" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                    PRICING
                  </Link>
                </li>
                <li className="hover:font-bold">
                  <Link href="/dashboard" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                    MORE
                  </Link>
                </li>
                <li className="hover:font-bold">
                  <Link href="/contact" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                    CONTACT US
                  </Link>
                </li>
                {isAdmin ? (
                  <>
                    <li className="hover:font-bold">
                      <Link href="/admin" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                        ADMIN
                      </Link>
                    </li>
                    <li className="hover:font-bold">
                      <Link href="/admin/plates" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                        PLATES
                      </Link>
                    </li>
                  </>
                ) : null}
              </ul>

              <div className="relative shrink-0">
                {isHero ? (
                  <Link href="/profile" className="cursor-pointer">
                    {meta?.avatar_url || meta?.picture || (profilePicUrl && profilePicUrl !== '/assets/mcb_icon.png') ? (
                      <Image
                        src={meta?.avatar_url || meta?.picture || profilePicUrl || ''}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-white object-cover hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center hover:bg-gray-100 transition cursor-pointer">
                        <svg className="w-6 h-6 text-[#003262]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </Link>
                ) : (
                  <Link href="/profile">
                    <button
                      type="button"
                      className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#FDB515] transition overflow-hidden border-2 border-white"
                    >
                      {profilePicUrl || meta?.avatar_url || meta?.picture ? (
                        <Image
                          src={profilePicUrl || meta?.avatar_url || meta?.picture || ''}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="rounded-full object-cover w-full h-full"
                        />
                      ) : (
                        <svg className="w-6 h-6 text-[#003262]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                      <span className="absolute top-0 right-0 w-3 h-3 bg-[#FDB515] rounded-full border-2 border-white" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        {!isHero && <div className="h-[74px]" />}
      </>
    )
  }

  let bgClass: string
  if (!isHero) {
    bgClass = 'bg-[#003262] border-none'
  } else {
    bgClass = scrolled ? 'bg-transparent border-none' : 'bg-transparent border-none border-transparent'
  }

  const marginClass = isEvent && !isHero ? 'mb-[10px]' : ''

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 w-full px-4 transition-all duration-300 ${bgClass} ${marginClass}`}>
        <div className="mx-auto flex max-w-8xl items-center justify-between py-3">
          <Link href="/profile" className="shrink-0">
            <Image
              src="/assets/mcb_icon.png"
              alt="MCB logo"
              width={48}
              height={48}
              className="rounded-full border-2 border-white object-cover"
            />
          </Link>

          <ul
            className={`flex gap-8 font-medium items-center
            ${
              scrolled
                ? 'opacity-0 pointer-events-none -translate-y-1'
                : 'opacity-100 translate-y-0'
            }
          `}
          >
            <li className="hover:font-bold">
              <Link href="/hero" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                HOME
              </Link>
            </li>
            <li className="hover:font-bold">
              <Link href="/form" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                ORDER&nbsp;FORMS
              </Link>
            </li>
            <li className="hover:font-bold">
              <Link href="/login" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                STAFF PORTAL
              </Link>
            </li>
            <li className="hover:font-bold">
              <Link href="/contact" className="text-[#FDB515]" style={{ color: '#FDB515' }}>
                FEEDBACK
              </Link>
            </li>

            <Link href="/login">
              <button
                type="button"
                className="px-5 py-2 border border-white text-white rounded-xl text-sm hover:bg-[#FDB515] hover:text-[#003262] transition"
              >
                SIGN IN
              </button>
            </Link>
          </ul>
        </div>
      </nav>
      {!isHero && <div className="h-[74px]" />}
    </>
  )
}
export default Navbar
