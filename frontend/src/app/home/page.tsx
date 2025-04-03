'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../navbar/page';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

const BerkeleyLabWelcome = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const response = await supabase.auth.getUser();
      const user = response.data.user;
      console.log(user);

      if (!user) {
        redirect('/login')
    }

      if (user) {
        setUser(user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || ""} />
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-blue-600 mt-10">
          Welcome to Berkeley Sequencing Lab
        </h1>
        {loading ? (
          <p className="text-gray-500">loading...</p>
        ) : user?  (
          <p className="text-gray-500">Hello {user.email}</p>
          
        ) : (
          <p className="text-gray-500">No user logged in </p>
        )}
      </div>
    </div>
  );
};

export default BerkeleyLabWelcome;
