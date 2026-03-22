/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';
import AnnouncementsTicker from '@/components/AnnouncementsTicker';
import { searchAll } from '../actions/search';
import type { SearchResult } from '@/types';

const Navbar = ({ profilePicUrl, user }: any) => {
  const router = useRouter();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const isHero = pathname === '/hero';
  const isEvent = pathname.startsWith('/form');

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // MORE dropdown state
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setUserIsAdmin(user?.user_metadata ? (user.user_metadata as Record<string, unknown>)?.is_admin === true : false);
  }, [user, supabase]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      const results = await searchAll(searchQuery, userIsAdmin);
      setSearchResults(results.slice(0, 5));
      setShowResults(true);
    }, 300);

    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery, userIsAdmin]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setShowResults(false); setSearchOpen(false); }
    if (e.key === 'Enter') { router.push(`/search?q=${encodeURIComponent(searchQuery)}`); setShowResults(false); setSearchOpen(false); }
  };

  // If user is signed in, show the new navbar design
  if (user) {
    return (
      <>
        <nav className="fixed inset-x-0 top-0 z-50 w-full bg-[#003262] px-4 transition-all duration-300">
          <div className="mx-auto flex max-w-8xl items-center justify-between py-3">
            {/* Logo */}
            <Link href={isHero ? "/hero" : "/dashboard"} className="shrink-0">
              <Image
                src="/assets/mcb_icon.png"
                alt="MCB logo"
                width={48}
                height={48}
                className="rounded-full border-2 border-white object-cover"
              />
            </Link>

            {/* Navigation Links and Profile Picture */}
            <div className="flex items-center gap-6">
              <ul className="flex gap-6 font-medium items-center uppercase text-sm">
                <li className="hover:font-bold"><Link href="/hero" className="text-[#FDB515]" style={{ color: '#FDB515' }}>HOME</Link></li>
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
                <li className="hover:font-bold"><Link href="/form" className="text-[#FDB515]" style={{ color: '#FDB515' }}>ORDER FORMS</Link></li>
                <li className="hover:font-bold"><Link href="/dashboard" className="text-[#FDB515]" style={{ color: '#FDB515' }}>PRICING</Link></li>
                <li className="hover:font-bold"><Link href="/faq" className="text-[#FDB515]" style={{ color: '#FDB515' }}>FAQ</Link></li>
                <li className="hover:font-bold"><Link href="/calendar" className="text-[#FDB515]" style={{ color: '#FDB515' }}>CALENDAR</Link></li>
                {/* MORE dropdown */}
                <li className="relative"
                  onMouseEnter={() => setMoreOpen(true)}
                  onMouseLeave={() => setMoreOpen(false)}
                >
                  <span className="hover:font-bold text-[#FDB515] cursor-pointer" style={{ color: '#FDB515' }}>MORE</span>
                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-[#003262] border border-[#FDB515] rounded-lg shadow-lg py-2 z-50">
                      <Link href="/links" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">LINKS & RESOURCES</Link>
                      <Link href="/results-guide" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">RESULTS GUIDE</Link>
                      <Link href="/team" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">TEAM</Link>
                      <Link href="/social" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">SOCIAL MEDIA</Link>
                      <Link href="/sample-guidelines" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">SAMPLE GUIDELINES</Link>
                      {userIsAdmin && (
                        <>
                          <div className="border-t border-[#FDB515] my-1" />
                          <Link href="/admin-dash" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">ADMIN DASHBOARD</Link>
                          <Link href="/admin-dash/announcements" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">ANNOUNCEMENTS</Link>
                          <Link href="/admin-dash/newsletter" className="block px-4 py-2 text-[#FDB515] hover:bg-white hover:text-[#003262] text-sm">NEWSLETTER</Link>
                        </>
                      )}
                    </div>
                  )}
                </li>
                <li className="hover:font-bold"><Link href="/contact" className="text-[#FDB515]" style={{ color: '#FDB515' }}>CONTACT US</Link></li>
              </ul>

              {/* Search */}
              <div ref={searchRef} className="relative">
                {searchOpen ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Search..."
                      autoFocus
                      className="w-48 px-3 py-1.5 rounded-lg text-sm text-gray-800 bg-white border-none focus:outline-none focus:ring-2 focus:ring-[#FDB515]"
                    />
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        {searchResults.map((result, idx) => (
                          <Link
                            key={idx}
                            href={result.url}
                            onClick={() => { setShowResults(false); setSearchOpen(false); setSearchQuery(''); }}
                            className="block px-4 py-2 hover:bg-gray-50"
                          >
                            <p className="text-sm font-medium text-[#003262]">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.description}</p>
                          </Link>
                        ))}
                        <Link
                          href={`/search?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => { setShowResults(false); setSearchOpen(false); }}
                          className="block px-4 py-2 text-center text-sm text-[#003262] font-medium border-t border-gray-100 hover:bg-gray-50"
                        >
                          View All Results
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setSearchOpen(true)} className="text-[#FDB515] hover:text-white transition">
                    <FiSearch size={20} />
                  </button>
                )}
              </div>

              {/* Profile Picture */}
              <div className="relative shrink-0">
                {isHero ? (
                  <Link href="/profile" className="cursor-pointer">
                    {(user?.user_metadata && ((user.user_metadata as Record<string, unknown>)?.avatar_url || (user.user_metadata as Record<string, unknown>)?.picture) || (profilePicUrl && profilePicUrl !== "/assets/mcb_icon.png")) ? (
                      <Image
                        src={((user?.user_metadata as Record<string, unknown>)?.avatar_url || (user?.user_metadata as Record<string, unknown>)?.picture || profilePicUrl || "") as string}
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
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#FDB515] transition overflow-hidden border-2 border-white">
                      {profilePicUrl || (user?.user_metadata && ((user.user_metadata as Record<string, unknown>)?.avatar_url || (user.user_metadata as Record<string, unknown>)?.picture)) ? (
                        <Image
                          src={(profilePicUrl || (user?.user_metadata as Record<string, unknown>)?.avatar_url || (user?.user_metadata as Record<string, unknown>)?.picture || "") as string}
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
                      <span className="absolute top-0 right-0 w-3 h-3 bg-[#FDB515] rounded-full border-2 border-white"></span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        {!isHero && <div className="h-[74px]" />}
        <AnnouncementsTicker />
      </>
    );
  }

  // Original navbar for non-signed-in users
  let bgClass: string;
  if (!isHero) {
    bgClass = 'bg-[#003262] border-none';
  } else {
    bgClass = scrolled
      ? 'bg-transparent border-none'
      : 'bg-transparent border-none border-transparent';
  }

  const marginClass = isEvent && !isHero ? 'mb-[10px]' : '';

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
            ${scrolled ? 'opacity-0 pointer-events-none -translate-y-1' :
              'opacity-100 translate-y-0'}
          `}
        >
          <li className="hover:font-bold"><Link href="/hero" className="text-[#FDB515]" style={{ color: '#FDB515' }}>HOME</Link></li>
          <li className="hover:font-bold"><Link href="/form" className="text-[#FDB515]" style={{ color: '#FDB515' }}>ORDER&nbsp;FORMS</Link></li>
          <li className="hover:font-bold"><Link href="/faq" className="text-[#FDB515]" style={{ color: '#FDB515' }}>FAQ</Link></li>
          <li className="hover:font-bold"><Link href="/calendar" className="text-[#FDB515]" style={{ color: '#FDB515' }}>CALENDAR</Link></li>
          <li className="hover:font-bold"><Link href="/contact" className="text-[#FDB515]" style={{ color: '#FDB515' }}>CONTACT</Link></li>

          {/* Show Sign In button */}
          <Link href="/login">
            <button className="px-5 py-2 border border-white text-white rounded-xl text-sm hover:bg-[#FDB515] hover:text-[#003262] transition">
              SIGN IN
            </button>
          </Link>
        </ul>
      </div>
    </nav>
    {!isHero && <div className="h-[74px]" />}
    </>
  );
}
export default Navbar;
