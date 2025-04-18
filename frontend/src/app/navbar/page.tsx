'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const Navbar = ({ profilePicUrl, user }: { profilePicUrl: string; user: any }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
      setIsAdmin(user?.user_metadata.is_admin)
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // optional: redirect to login
  };

  return (
    <nav className="bg-[#1e3c71] py-2 px-6 flex justify-between items-center">
      {/* Logo Placeholder */}
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center border-2 border-white p-0.5 justify-center text-xs text-gray-600">
        <Link href="/profile">
          <Image
            src="/assets/mcb_icon.png"
            alt="MCB Logo"
            width={48}
            height={48}
            className="object-cover"
          />
        </Link>
      </div>

      <ul className="flex space-x-8 text-white font-medium items-center">
        <li className="hover:font-bold cursor-pointer"><Link href="/dashboard">HOME</Link></li>
        <li className="hover:font-bold cursor-pointer">SERVICES</li>
        <li className="hover:font-bold cursor-pointer"><Link href="/form">ORDER FORMS</Link></li>
        <li className="hover:font-bold cursor-pointer">PRICING</li>
        <li className="hover:font-bold cursor-pointer">MORE</li>
        <li className="hover:font-bold cursor-pointer"><Link href="/contact">FEEDBACK</Link></li>

        {/* Show Admin Dashboard link if user is an admin */}
        {isAdmin && (
          <li className="hover:font-bold cursor-pointer">
            <Link href="/admin-dash">ADMIN DASHBOARD</Link>
          </li>
        )}

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
    </nav>
  );
};

export default Navbar;
