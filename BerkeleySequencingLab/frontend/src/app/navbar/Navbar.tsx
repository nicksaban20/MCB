'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  profilePicUrl?: string;
  user?: User | null;
}

type Role = 'customer' | 'staff' | 'superadmin' | null;

type NavLink = {
  label: string;
  href: string;
};

const serviceLinks: NavLink[] = [
  { label: 'CELL LINE AUTHENTICATION', href: '/cell-line' },
  { label: 'DNA FRAGMENT ANALYSIS', href: '/dashboard' },
  { label: 'DNA NORMALIZATION', href: '/dashboard' },
  { label: 'DNA QUANTIFICATION', href: '/dashboard' },
  { label: 'OPEN ACCESS INSTRUMENTS', href: '/dashboard' },
  { label: 'PCR REACTION CLEANUP', href: '/dashboard' },
  { label: 'PLASMID & GENOMIC DNA', href: '/dashboard' },
  { label: 'PLASMID SEQUENCING', href: '/dashboard' },
  { label: 'SANGER SEQUENCING', href: '/dashboard' },
  { label: 'STEM CELL AUTHENTICATION', href: '/dashboard' },
  { label: 'STOCK PRIMERS (FREE)', href: '/dashboard' },
];

export default function Navbar({ profilePicUrl = '', user = null }: NavbarProps) {
  const [role, setRole] = useState<Role>(null);
  const [supabase] = useState(() => createClient());
  const pathname = usePathname();
  const isHero = pathname === '/hero';
  const isEvent = pathname.startsWith('/form');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    const loadAdminState = async () => {
      if (!user?.id) {
        setRole(null);
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading user role:', error);
        setRole(user?.user_metadata?.is_admin ? 'staff' : 'customer');
        return;
      }

      setRole((profile?.role as Role) ?? 'customer');
    };

    loadAdminState();
  }, [supabase, user?.id, user?.user_metadata?.is_admin]);

  const isAdmin = role === 'staff' || role === 'superadmin';
  const isSuperadmin = role === 'superadmin';

  const authenticatedLinks = useMemo<NavLink[]>(() => {
    const links: NavLink[] = [
      { label: 'HOME', href: '/hero' },
      { label: 'ORDER FORMS', href: '/form' },
    ];

    if (isAdmin) {
      links.push({ label: 'ADMIN DASHBOARD', href: '/admin-dash' });
    }

    if (isSuperadmin) {
      links.push({ label: 'SUPERADMIN', href: '/superadmin' });
    }

    links.push(
      { label: 'PRICING', href: '/dashboard' },
      { label: 'MORE', href: '/dashboard' },
      { label: 'CONTACT US', href: '/contact' }
    );

    return links;
  }, [isAdmin, isSuperadmin]);

  const guestLinks: NavLink[] = [
    { label: 'HOME', href: '/hero' },
    { label: 'ORDER FORMS', href: '/form' },
    { label: 'FEEDBACK', href: '/contact' },
  ];

  const profileImageSrc =
    profilePicUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

  const navBaseClass = user || !isHero
    ? 'bg-[#003262]'
    : scrolled
      ? 'bg-transparent'
      : 'bg-transparent';

  const marginClass = isEvent && !isHero ? 'mb-[10px]' : '';

  return (
    <>
      <nav className={`fixed inset-x-0 top-0 z-50 w-full px-4 transition-all duration-300 ${navBaseClass} ${marginClass}`}>
        <div className="mx-auto flex max-w-8xl items-center justify-between py-3">
          <Link href={user ? (isHero ? '/hero' : '/dashboard') : '/hero'} className="shrink-0">
            <Image
              src="/assets/mcb_icon.png"
              alt="MCB logo"
              width={48}
              height={48}
              className="rounded-full border-2 border-white object-cover"
            />
          </Link>

          {user ? (
            <>
              <div className="hidden items-center gap-6 lg:flex">
                <ul className="flex items-center gap-6 text-sm font-medium uppercase">
                  <li className="hover:font-bold">
                    <Link href="/hero" className="text-[#FDB515]">
                      HOME
                    </Link>
                  </li>
                  <li className="relative group">
                    <button type="button" className="flex items-center gap-1 text-[#FDB515] hover:font-bold">
                      <span>SERVICES</span>
                      <FiChevronDown className="h-4 w-4" />
                    </button>
                    <div className="invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-[#FDB515] bg-[#003262] py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      {serviceLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block px-4 py-2 text-sm text-[#FDB515] hover:bg-white hover:text-[#003262]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </li>
                  {authenticatedLinks.slice(1).map((link) => (
                    <li key={link.label} className="hover:font-bold">
                      <Link href={link.href} className="text-[#FDB515]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="relative shrink-0">
                  <Link href="/profile" className="block">
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white transition hover:bg-[#FDB515]">
                      {profileImageSrc ? (
                        <Image
                          src={profileImageSrc}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <svg className="h-6 w-6 text-[#003262]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      )}
                      <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#FDB515]"></span>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:hidden">
                <Link href="/profile" className="block">
                  <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white">
                    {profileImageSrc ? (
                      <Image
                        src={profileImageSrc}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <svg className="h-6 w-6 text-[#003262]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                    <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#FDB515]"></span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white text-white"
                  aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                >
                  {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                </button>
              </div>
            </>
          ) : (
            <>
              <ul
                className={`hidden items-center gap-8 font-medium lg:flex ${
                  scrolled ? 'opacity-0 pointer-events-none -translate-y-1' : 'opacity-100 translate-y-0'
                }`}
              >
                {guestLinks.map((link) => (
                  <li key={link.label} className="hover:font-bold">
                    <Link href={link.href} className="text-[#FDB515]">
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/login">
                    <button className="rounded-xl border border-white px-5 py-2 text-sm text-white transition hover:bg-[#FDB515] hover:text-[#003262]">
                      SIGN IN
                    </button>
                  </Link>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white text-white lg:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="mx-auto mb-3 max-w-8xl rounded-2xl border border-[#2a4f82] bg-[#0c3a6c] p-4 lg:hidden">
            {user ? (
              <div className="space-y-3">
                <Link href="/hero" className="block rounded-lg px-3 py-2 text-sm font-medium text-[#FDB515] hover:bg-[#11467f]">
                  HOME
                </Link>
                <div className="rounded-lg border border-[#2a4f82]">
                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-[#FDB515]"
                  >
                    <span>SERVICES</span>
                    <FiChevronDown className={`h-4 w-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="space-y-1 border-t border-[#2a4f82] px-2 py-2">
                      {serviceLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="block rounded-md px-3 py-2 text-xs font-medium text-white hover:bg-[#11467f]"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                {authenticatedLinks.slice(1).map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[#FDB515] hover:bg-[#11467f]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {guestLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-[#FDB515] hover:bg-[#11467f]"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/login" className="block">
                  <button className="w-full rounded-xl border border-white px-5 py-2 text-sm text-white transition hover:bg-[#FDB515] hover:text-[#003262]">
                    SIGN IN
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
      {!isHero && <div className="h-[74px] sm:h-[82px]" />}
    </>
  );
}
