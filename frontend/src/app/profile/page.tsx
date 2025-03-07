'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  // placeholder user
  const [user, setUser] = useState({
    name: 'Altay Hodo (placeholder)',
    email: 'altay.hodo@gmail.com',
    profilePic: '/',
  });

  return (
    <div className="flex flex-col items-center mt-10 ">
      <div className="flex flex-col items-center">
        <Image
          src={user.profilePic}
          alt="Profile Picture"
          width={100}
          height={100}
          className="rounded-full border-2 border-gray-300"
        />
        <p className="mt-4 text-xl font-bold">{user.name}</p>
        <p>{user.email}</p>

        <label htmlFor="password" className="block mt-4 ">
          Enter New Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="type here"
          className="border rounded-md "
        />
        <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
          Change password
        </button>

        <button className="mt-5 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700">
          Delete Account
        </button>

        <Link href="/">
          <button className="border mt-5">back to homepage</button>
        </Link>
      </div>
    </div>
  );
}
