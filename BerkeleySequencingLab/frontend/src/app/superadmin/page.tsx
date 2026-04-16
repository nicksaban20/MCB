'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Navbar from '../navbar/Navbar';
import { createClient } from '@/utils/supabase/client';

type Role = 'customer' | 'staff' | 'superadmin';

type UserProfileRow = {
  id: string;
  role: Role;
  is_active: boolean;
  deactivated_at: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string | null;
};

type SiteSettings = {
  siteName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  announcementText: string;
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

function formatAccountStatus(profile: UserProfileRow) {
  return profile.is_active ? 'Active' : 'Deactivated';
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
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Berkeley Sequencing Lab',
    supportEmail: 'berkeleysequencinglab@gmail.com',
    maintenanceMode: false,
    announcementText: '',
  });

  const loadSuperadminData = async () => {
    const [usersResponse, settingsResponse] = await Promise.all([
      fetch('/api/superadmin/users'),
      fetch('/api/superadmin/site-settings'),
    ]);
    const responseBody = await usersResponse.json();

    if (!usersResponse.ok) {
      throw new Error(responseBody?.details || responseBody?.error || 'Failed to load superadmin data');
    }

    setProfiles((responseBody?.profiles ?? []) as UserProfileRow[]);

    const settingsBody = await settingsResponse.json();
    if (!settingsResponse.ok) {
      throw new Error(settingsBody?.details || settingsBody?.error || 'Failed to load site settings');
    }

    setSettings(settingsBody.settings as SiteSettings);
  };

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
        await loadSuperadminData();
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

      const response = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          role: nextRole,
        }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to update role');
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === profileId ? (responseBody.profile as UserProfileRow) : profile
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

  const toggleActivation = async (profileId: string, isActive: boolean) => {
    if (!currentUser || profileId === currentUser.id) {
      return;
    }

    try {
      setSavingId(profileId);
      setSaveError(null);
      setSaveSuccess(null);

      const response = await fetch('/api/superadmin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          isActive,
        }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to update account status');
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) =>
          profile.id === profileId ? (responseBody.profile as UserProfileRow) : profile
        )
      );
      setSaveSuccess(isActive ? 'Account reactivated successfully.' : 'Account deactivated successfully.');
    } catch (statusError) {
      const message = statusError instanceof Error ? statusError.message : 'Unknown error';
      setSaveError(message);
    } finally {
      setSavingId(null);
    }
  };

  const downloadBackup = async () => {
    try {
      setBackupLoading(true);
      setSaveError(null);
      setSaveSuccess(null);

      const response = await fetch('/api/superadmin/backup');
      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to export backup');
      }

      const exportedAt = typeof responseBody.exportedAt === 'string'
        ? responseBody.exportedAt.replace(/[:.]/g, '-')
        : 'backup';

      const blob = new Blob([JSON.stringify(responseBody, null, 2)], {
        type: 'application/json',
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `berkeley-sequencing-backup-${exportedAt}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);

      setSaveSuccess('Backup downloaded successfully.');
    } catch (backupError) {
      const message = backupError instanceof Error ? backupError.message : 'Unknown error';
      setSaveError(message);
    } finally {
      setBackupLoading(false);
    }
  };

  const saveSiteSettings = async () => {
    try {
      setSettingsLoading(true);
      setSaveError(null);
      setSaveSuccess(null);

      const response = await fetch('/api/superadmin/site-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to save site settings');
      }

      setSettings(responseBody.settings as SiteSettings);
      setSaveSuccess('Site settings saved successfully.');
    } catch (settingsError) {
      const message = settingsError instanceof Error ? settingsError.message : 'Unknown error';
      setSaveError(message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const restoreBackup = async () => {
    if (!restoreFile) {
      setSaveError('Choose a backup JSON file before restoring.');
      setSaveSuccess(null);
      return;
    }

    try {
      setRestoreLoading(true);
      setSaveError(null);
      setSaveSuccess(null);

      const fileText = await restoreFile.text();
      const parsedBackup = JSON.parse(fileText);

      const response = await fetch('/api/superadmin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedBackup),
      });
      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to restore backup');
      }

      await loadSuperadminData();
      setRestoreFile(null);
      setSaveSuccess('Backup restored successfully. Audit logs remain append-only for safety.');
    } catch (restoreError) {
      const message = restoreError instanceof Error ? restoreError.message : 'Unknown error';
      setSaveError(message);
    } finally {
      setRestoreLoading(false);
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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Superadmin Controls</h1>
          <p className="text-gray-600">
            Manage elevated roles from one place. This page is only for superadmins.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            Download a JSON backup snapshot of the operational tables before making major changes. Restore will replay the snapshot data and keep audit logs append-only for safety.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={downloadBackup}
              disabled={backupLoading}
              className="rounded-xl bg-[#0A215C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00184a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {backupLoading ? 'Preparing backup...' : 'Download Backup JSON'}
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Restore Backup</h2>
            <p className="mt-1 text-sm text-amber-900">
              Use a previously exported backup JSON from this system. This replaces the operational tables in the current project, so it is best used on local or staging environments first.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <label className="block flex-1">
              <span className="mb-1 block text-sm font-medium text-gray-700">Backup JSON File</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(event) => setRestoreFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </label>

            <button
              type="button"
              onClick={restoreBackup}
              disabled={restoreLoading || !restoreFile}
              className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {restoreLoading ? 'Restoring backup...' : 'Restore Backup JSON'}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-600">
            Restore replaces operational records and site settings. User roles in <code>user_profiles</code> and audit logs are intentionally skipped so the current admin access path stays safe.
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

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Site Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">
              Save operational settings that only superadmins should control.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Site Name</span>
              <input
                type="text"
                value={settings.siteName}
                onChange={(event) => setSettings((current) => ({ ...current, siteName: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Support Email</span>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(event) => setSettings((current) => ({ ...current, supportEmail: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Announcement Text</span>
            <textarea
              value={settings.announcementText}
              onChange={(event) => setSettings((current) => ({ ...current, announcementText: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
            />
          </label>

          <label className="mt-4 flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(event) =>
                setSettings((current) => ({ ...current, maintenanceMode: event.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            Enable maintenance mode flag
          </label>

          <div className="mt-4">
            <button
              type="button"
              onClick={saveSiteSettings}
              disabled={settingsLoading}
              className="rounded-xl bg-[#0A215C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#00184a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {settingsLoading ? 'Saving settings...' : 'Save Site Settings'}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">User Role Management</h2>
            <p className="mt-1 text-sm text-gray-500">
              Role changes here write directly to <code>public.user_profiles</code>.
            </p>
          </div>

          <div className="hidden overflow-x-auto md:block">
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
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Access
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
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            profile.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {formatAccountStatus(profile)}
                        </span>
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
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={isCurrentUser || savingId === profile.id}
                          onClick={() => toggleActivation(profile.id, !profile.is_active)}
                          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                            profile.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          } disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
                        >
                          {profile.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {profiles.map((profile) => {
              const isCurrentUser = profile.id === currentUser?.id;

              return (
                <div key={profile.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">User</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDisplayName(profile, currentUser?.id ?? null)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">User ID</p>
                      <p className="break-all text-sm text-gray-500">{profile.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</p>
                        <p className="text-sm text-gray-500">{profile.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Created</p>
                        <p className="text-sm text-gray-500">{formatCreatedAt(profile.created_at)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Account</p>
                      <p className="text-sm text-gray-900">{formatAccountStatus(profile)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</p>
                      <select
                        value={profile.role}
                        disabled={isCurrentUser || savingId === profile.id}
                        onChange={(event) => updateRole(profile.id, event.target.value as Role)}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {ROLE_OPTIONS.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {roleOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={isCurrentUser || savingId === profile.id}
                      onClick={() => toggleActivation(profile.id, !profile.is_active)}
                      className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                        profile.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      } disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
                    >
                      {profile.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
