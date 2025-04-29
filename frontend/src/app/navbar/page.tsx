'use client';


import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';


const Navbar = ({ profilePicUrl, user }: { profilePicUrl: string; user: any }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();
  const isHero = pathname === '/hero';
  const isEvent = pathname.startsWith('/form');

  useEffect(() => {
    setIsAdmin(user?.user_metadata.is_admin)
  }, [user, supabase]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  let bgClass: string;
  if (!isHero) {
    // any non-hero page is solid
    bgClass = 'bg-[#003262] border-none';
  } else {
    // on hero page, preserve transparent → on-scroll logic
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
          className={`flex gap-8 text-white font-medium items-center
            ${scrolled ? 'opacity-0 pointer-events-none -translate-y-1' :
              'opacity-100 translate-y-0'}
          `}
        >
          <li className="hover:font-bold"><Link href="/dashboard">HOME</Link></li>
          <li className="hover:font-bold"><Link href="/form">ORDER&nbsp;FORMS</Link></li>
          <li className="hover:font-bold"><Link href="/admin-dash">ADMIN DASHBOARD</Link></li>
          <li className="hover:font-bold"><Link href="/plate-selection">PLATE SELECTION</Link></li>
          <li className="hover:font-bold"><Link href="/contact">FEEDBACK</Link></li>




          {/* Show Admin Dashboard link if user is an admin 
          {isAdmin && (
            <li className="hover:font-bold cursor-pointer">
              <Link href="/admin-dash">ADMIN DASHBOARD</Link>
              <Link href="/plate-selection">PLATE SELECTION</Link>
            </li>
          )}
          */}

          {/* Show Sign Out or Sign In depending on user */}
          {user ? (
            <button
              onClick={handleLogout}
              className="px-5 py-2 border border-white text-white rounded-xl text-sm hover:bg-[#485486a2] transition"
            >
              SIGN OUT
            </button>
          ) : (
            <Link href="/login">
              <button className="px-5 py-2 border border-white text-white rounded-xl text-sm hover:bg-[#485486a2] transition">
                SIGN IN
              </button>
            </Link>
          )}
        </ul>
      </div>
    </nav>
    {!isHero && <div className="h-[74px]" />}
    </>
  );
}
export default Navbar;