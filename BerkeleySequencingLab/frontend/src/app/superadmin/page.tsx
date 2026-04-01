'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Navbar from '../navbar/page';
import { createClient } from '@/utils/supabase/client';

type Role = 'customer' | 'staff' | 'superadmin';

type UserProfileRow = {
  id: string;
  role: Role;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string | null;
};

const ROLE_OPTIONS: Role[] = ['customer', 'staff', 'superadmin'];

function formatDisplayName(profile: UserProfileRow, currentUserId: string | null) {
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  const shortId = `${profile.id.slice(0, 8)}...`;

  if (profile.id === currentUserId) {
    return fullName ? `${fullName} (You)` : `Current User (${shortId})`;
  }

  return fullName || shortId;
}

function formatCreatedAt(dateString: string | null) {
  if (!dateString) {
    return 'Unknown';
  }

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SuperadminPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<UserProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSuperadminPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          router.replace('/unauthorized?reason=auth');
          return;
        }

        setCurrentUser(user);

        const { data: myProfile, error: myProfileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (myProfileError) {
          throw new Error(myProfileError.message);
        }

        if (myProfile?.role !== 'superadmin') {
          router.replace('/unauthorized?reason=superadmin');
          return;
        }

        setAuthorized(true);

        const { data: profileRows, error: profileRowsError } = await supabase
          .from('user_profiles')
          .select('id, role, first_name, last_name, phone, created_at')
          .order('created_at', { ascending: true });

        if (profileRowsError) {
          throw new Error(profileRowsError.message);
        }

        setProfiles((profileRows ?? []) as UserProfileRow[]);
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadSuperadminPage();
  }, [router, supabase]);

  const updateRole = async (profileId: string, nextRole: Role) => {
    if (!currentUser || profileId === currentUser.id) {
      return;
    }

    try {
      setSavingId(profileId);
      setSaveError(null);
      setSaveSuccess(null);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: nextRole })
        .eq('id', profileId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === profileId ? { ...profile, role: nextRole } : profile
        )
      );
      setSaveSuccess('Role updated successfully.');
    } catch (roleError) {
      const message = roleError instanceof Error ? roleError.message : 'Unknown error';
      setSaveError(message);
    } finally {
      setSavingId(null);
    }
  };

  const roleCounts = profiles.reduce(
    (counts, profile) => {
      counts[profile.role] += 1;
      return counts;
    },
    { customer: 0, staff: 0, superadmin: 0 }
  );

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Checking superadmin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-lg text-red-600">Error loading superadmin tools: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        profilePicUrl={currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.picture || ''}
        user={currentUser}
      />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Superadmin Controls</h1>
          <p className="text-gray-600">
            Manage elevated roles from one place. This page is only for superadmins.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Customers</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{roleCounts.customer}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Staff</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{roleCounts.staff}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Superadmins</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{roleCounts.superadmin}</p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Your own row is locked on this page so you do not accidentally remove your own superadmin access.
        </div>

        {saveSuccess && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {saveSuccess}
          </div>
        )}

        {saveError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {saveError}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">User Role Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Role changes here write directly to <code>public.user_profiles</code>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {profiles.map((profile) => {
                  const isCurrentUser = profile.id === currentUser?.id;

                  return (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatDisplayName(profile, currentUser?.id ?? null)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{profile.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{profile.phone || 'Not set'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatCreatedAt(profile.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={profile.role}
                          disabled={isCurrentUser || savingId === profile.id}
                          onChange={(event) => updateRole(profile.id, event.target.value as Role)}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                        >
                          {ROLE_OPTIONS.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {roleOption}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
