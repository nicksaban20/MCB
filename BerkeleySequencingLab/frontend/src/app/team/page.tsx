'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const TeamPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return null;

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#003262] text-white py-12">
          <div className="max-w-5xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold">Our Team</h1>
            <p className="mt-3 text-[#FDB515] text-lg">The people behind the UC Berkeley DNA Sequencing Facility</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#003262] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#FDB515]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#003262] mb-3">Coming Soon</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Team member profiles are being prepared. Check back soon to meet the people who make the Berkeley Sequencing Lab possible.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamPage;
