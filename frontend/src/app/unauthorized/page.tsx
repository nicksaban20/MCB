// src/app/unauthorized/page.tsx
import React from 'react';
import Link from 'next/link';
import Navbar from '../navbar/page';

export default function Unauthorized() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 bg-gray-100">
        <div className="w-full max-w-md space-y-8 text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-6xl font-bold text-[#002676]">403</div>
          <h1 className="text-3xl font-bold text-[#0A215C]">Unauthorized Access</h1>
          <p className="text-gray-600 mb-6">You must be logged in to view this page.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-3 bg-[#002676] text-white rounded-md hover:bg-[#001a5c] transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}