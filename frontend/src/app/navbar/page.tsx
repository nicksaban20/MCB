'use client';

import Image   from 'next/image';
import Link    from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Navbar({
  profilePicUrl,
  user,
}: {
  profilePicUrl: string;
  user: any;
}) {
  const [scrolled, setScrolled] = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 w-full px-4 transition-all duration-300
        ${scrolled
          ? 'bg-transparent border-none'
          : 'bg-transparent border-none border-transparent'}
      `}
    >      
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
          <li className="hover:font-bold"><Link href="/services">SERVICES</Link></li>
          <li className="hover:font-bold"><Link href="/form">ORDER&nbsp;FORMS</Link></li>
          <li className="hover:font-bold"><Link href="/pricing">PRICING</Link></li>
          <li className="hover:font-bold"><Link href="/more">MORE</Link></li>
          <li className="hover:font-bold"><Link href="/contact">FEEDBACK</Link></li>

          {user ? (
            <li>
              <button
                onClick={handleLogout}
                className="rounded-xl border border-white px-5 py-2 text-sm transition hover:bg-white/20"
              >
                SIGN&nbsp;OUT
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login">
                <button className="rounded-xl border border-white px-5 py-2 text-sm transition hover:bg-white/20">
                  SIGN&nbsp;IN
                </button>
              </Link>
            </li>
          )}
        </ul>        
      </div>
    </nav>
  );
}
