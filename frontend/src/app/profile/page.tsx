'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';

type User = {
  email: string | undefined;
  id: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();


  useEffect(() => {
    async function getProfile() {
      const { data: { session }, error } = await supabase.auth.getSession();
  
      if (error || !session) {
        router.push('/login');
        return;
      }
  
      setUser({
        email: session.user.email,
        id: session.user.id,
      });
      setLoading(false);
    }
  
    getProfile();
  }, [router]);


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert('Error updating password: ' + error.message);
    } else {
      alert('Password updated successfully!');
      (form.elements.namedItem('password') as HTMLInputElement).value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      alert('Please contact support to delete your account.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-700">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-start py-20 px-4 bg-white min-h-screen text-black">
      <div className="max-w-2xl w-full border border-gray-300 rounded-2xl p-10 shadow-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4">
            {user?.email?.[0].toUpperCase()}
          </div>
          <h1 className="text-3xl font-semibold">Your Profile</h1>
          <p className="text-gray-500 mt-1">{user?.email}</p>
        </div>

        {/* Update Password */}
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-6">
          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 font-medium mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm"
          >
            Update Password
          </button>
        </form>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleDeleteAccount}
            className="w-full text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete Account
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-sm bg-gray-200 text-black py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>
          <Link href="/">
            <button className="w-full text-sm border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Back to Homepage
            </button>
          </Link>
        </div>

        {/* File Upload */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          <FileUpload />
        </div>
      </div>
    </div>
  );
  }
