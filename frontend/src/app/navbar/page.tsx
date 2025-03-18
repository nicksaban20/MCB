import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = ({ profilePicUrl }: { profilePicUrl: string }) => {
  return (
    <nav className="bg-white py-4 px-6 flex justify-between items-center border-b">
      {/* Logo Placeholder */}
      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xs text-gray-600">
        <Link href="/profile">logo</Link>
      </div>

      <ul className="flex space-x-8 text-gray-700 font-medium items-center">
        <li className="hover:text-black cursor-pointer"><Link href="/dashboard">HOME</Link></li>
        <li className="hover:text-black cursor-pointer">SERVICES</li>
        <li className="hover:text-black cursor-pointer"><Link href="/form">ORDER FORMS</Link></li>
        <li className="hover:text-black cursor-pointer">PRICING</li>
        <li className="hover:text-black cursor-pointer">MORE</li>
        <li className="hover:text-black cursor-pointer">CONTACT</li>

        {/* Profile Picture Link */}
        <Link href="/profile">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
            {profilePicUrl ? (
              <Image 
                className="rounded-full"
                src={profilePicUrl}
                width={48}
                height={48}
                alt="profile image"
              />
            ) : (
              <span className="text-[10px] text-gray-500">Profile Picture</span>
            )}
          </div>
        </Link>
      </ul>
    </nav>
  );
};

export default Navbar;
