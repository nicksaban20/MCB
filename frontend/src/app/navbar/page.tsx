import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white py-4 px-6 flex justify-between items-center border-b">
      {/* Logo Placeholder */}
      <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      
      {/* Navigation Links */}
      <ul className="flex space-x-8 text-gray-700 font-medium">
        <li className="hover:text-black cursor-pointer"><Link href="/dashboard">HOME</Link></li>
        <li className="hover:text-black cursor-pointer">SERVICES</li>
        <li className="hover:text-black cursor-pointer">ORDER FORMS</li>
        <li className="hover:text-black cursor-pointer">PRICING</li>
        <li className="hover:text-black cursor-pointer">MORE</li>
        <li className="hover:text-black cursor-pointer">CONTACT</li>
      </ul>
    </nav>
  );
};
export default Navbar;