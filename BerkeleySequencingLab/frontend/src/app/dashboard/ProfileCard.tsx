'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { User } from '@supabase/supabase-js';

interface OrgData {
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  name?: string;
  department?: string;
}

interface ProfileCardProps {
  user: User | null;
  orgData: OrgData | null;
  avatarUrl: string;
}

export default function ProfileCard({ user, orgData, avatarUrl }: ProfileCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const firstName = user?.user_metadata?.firstName || user?.user_metadata?.name?.split(' ')[0] || '';
  const lastName = user?.user_metadata?.lastName || user?.user_metadata?.name?.split(' ').slice(1).join(' ') || '';
  const email = user?.email || '';
  
  // Form state
  const [formData, setFormData] = useState({
    phone: orgData?.phone || '',
    streetAddress: orgData?.street_address || '',
    city: orgData?.city || '',
    state: orgData?.state || '',
    zipCode: orgData?.zip_code || '',
    organization: orgData?.name || '',
    department: orgData?.department || '',
  });

  // Update form data when orgData changes
  useEffect(() => {
    setFormData({
      phone: orgData?.phone || '',
      streetAddress: orgData?.street_address || '',
      city: orgData?.city || '',
      state: orgData?.state || '',
      zipCode: orgData?.zip_code || '',
      organization: orgData?.name || '',
      department: orgData?.department || '',
    });
  }, [orgData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      phone: orgData?.phone || '',
      streetAddress: orgData?.street_address || '',
      city: orgData?.city || '',
      state: orgData?.state || '',
      zipCode: orgData?.zip_code || '',
      organization: orgData?.name || '',
      department: orgData?.department || '',
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // First, check if organization exists
      const { data: existingOrg, error: checkError } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check error only if it's not a "not found" error
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const orgDataToSave = {
        user_id: user.id,
        name: formData.organization || null,
        phone: formData.phone || null,
        street_address: formData.streetAddress || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zipCode || null,
        department: formData.department || null,
      };

      let result;
      if (existingOrg) {
        // Update existing record
        result = await supabase
          .from('organizations')
          .update(orgDataToSave)
          .eq('user_id', user.id);
      } else {
        // Insert new record
        result = await supabase
          .from('organizations')
          .insert([orgDataToSave]);
      }

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw new Error(result.error.message || 'Failed to save profile');
      }

      showToast('Profile saved successfully!', 'success');

      router.refresh();
      setIsEditing(false);
    } catch (error: unknown) {
      console.error('Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatAddress = () => {
    const parts = [];
    if (formData.streetAddress) parts.push(formData.streetAddress);
    if (formData.city || formData.state || formData.zipCode) {
      const cityStateZip = [formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ');
      if (cityStateZip) parts.push(cityStateZip);
    }
    return parts.length > 0 ? parts.join('\n') : '';
  };

  return (
    <>
      <div className="mb-6 flex justify-between items-start">
        <h1 className="text-3xl text-[#003262] font-bold">Welcome Back!</h1>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 border border-[#003262] rounded-lg text-[#003262] hover:bg-[#003262] hover:text-white transition-colors"
          >
            <span>Edit</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#003262]">
        <div className="flex items-start gap-6">
          {/* Left Column: Profile Picture, Name, Email, Phone */}
          <div className="flex items-start gap-4 flex-1">
            <img
              src={avatarUrl}
              alt="Profile"
              className="rounded-full w-20 h-20 object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#003262] mb-1">
                {firstName} {lastName}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span>{email}</span>
                {!isEditing && formData.phone && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span>{formatPhone(formData.phone)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column: Address */}
          <div className="flex-1">
            {!isEditing ? (
              <div className="text-gray-600 text-sm whitespace-pre-line">
                {formatAddress() || 'No address set'}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Zip"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-20 p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Organization and Department */}
          <div className="flex-1">
            {!isEditing ? (
              <>
                <p className="text-gray-600 text-sm mb-1">{formData.organization || 'No organization set'}</p>
                <p className="text-gray-600 text-sm">{formData.department || 'No department set'}</p>
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

