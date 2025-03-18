import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = ({ profilePicUrl }: { profilePicUrl: string }) => {
  return (
    <nav className="bg-white py-4 px-6 flex justify-between items-center border-b">
      {/* Logo Placeholder */}
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-60"><Link href="/profile">logo</Link></div>

      {/* Navigation Links */}
      <ul className="flex space-x-8 text-gray-700 font-medium items-center">
        <li className="hover:text-black cursor-pointer"><Link href="/dashboard">HOME</Link></li>
        <li className="hover:text-black cursor-pointer">SERVICES</li>
        <li className="hover:text-black cursor-pointer"><Link href="/form">ORDER FORMS</Link></li>
        <li className="hover:text-black cursor-pointer">PRICING</li>
        <li className="hover:text-black cursor-pointer">MORE</li>
        <li className="hover:text-black cursor-pointer">CONTACT</li>
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
        {profilePicUrl !== '' && (
          <Image 
            className="rounded-full"
            src={profilePicUrl}
            width={50}
            height={50}
            alt={'profile image'}
          />
        )}
      </div>
      </ul>

    </nav>
  );
};
export default Navbar;
