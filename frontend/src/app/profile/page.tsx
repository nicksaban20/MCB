'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  type User = {
    email: string | undefined;
    id: string;
  };

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
    
    const { error } = await supabase.auth.updateUser({
      password
    });
  
    if (error) {
      alert('Error updating password: ' + error.message);
    } else {
      alert('Password updated successfully!');
      (form.elements.namedItem('password') as HTMLInputElement).value = '';
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      // You'll need to set up a server endpoint to handle account deletion
      // as it requires admin privileges
      alert('Please contact support to delete your account.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center mt-10 p-4">
      <div className="flex flex-col items-center max-w-md w-full">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          {/* Placeholder avatar with first letter of email */}
          <span className="text-3xl">{user?.email?.[0].toUpperCase()}</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="w-full bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="text-gray-600">Email</label>
            <p className="font-medium">{user?.email}</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-gray-600">
                New Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="w-full p-2 border rounded-md"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Update Password
            </button>
          </form>

          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>

          <button
            onClick={handleSignOut}
            className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Sign Out
          </button>

          <Link href="/">
            <button className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Back to Homepage
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}