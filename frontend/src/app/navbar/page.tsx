import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = ({ profilePicUrl }: { profilePicUrl: string }) => {
  return (
    <nav className="bg-[#233A77] py-2 px-6 flex justify-between items-center">
      {/* Logo Placeholder */}
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center border-2 border-white p-0.2 justify-center text-xs text-gray-600">
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
        <li className="hover:font-bold cursor-pointer">CONTACT</li>
         {/* Profile Picture Link */}
         <Link href="/login">
          <button className="px-5 py-2 border border-white text-white rounded-xl text-sm hover:bg-[#485486a2] transition">
            SIGN IN
          </button>
        </Link>
        {/* Profile Picture Link */}
        {/* <Link href="/login">
          <button className="px-5 py-2 border border-[#002676] text-[#002676] rounded-xl text-sm hover:bg-[#f0f3ff] transition">
            SIGN IN
          </button>
        </Link> */}
      </ul>
    </nav>
  );
};

export default Navbar;
