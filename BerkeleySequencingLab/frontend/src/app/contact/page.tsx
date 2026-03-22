'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { sendFeedbackEmail } from '../actions/email';
import { User } from '@supabase/supabase-js';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'General Feedback',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // Pre-fill name and email from user context
        const firstName = data.user.user_metadata?.firstName || '';
        const lastName = data.user.user_metadata?.lastName || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        setFormData(prev => ({
          ...prev,
          name: fullName || prev.name,
          email: data.user.email || prev.email,
        }));
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await sendFeedbackEmail(formData);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to send message. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="flex flex-col md:flex-row min-h-screen">

        {/* Right: Illustration */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center rounded-lg">
          <img
            src="/assets/750.jpg"
            alt="Contact Illustration"
            className="max-w-full max-h-[90%] object-contain"
          />
        </div>
        {/*Left Form */}
        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-[#002676] mb-6">Feedback</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-gray-600">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-1 text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676]"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-1 text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676]"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="issueType" className="block text-sm font-semibold mb-1 text-gray-700">
                    Issue Type
                  </label>
                  <select
                    id="issueType"
                    name="issueType"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002676]"
                    value={formData.issueType}
                    onChange={handleChange}
                  >
                    <option value="Missing Samples">Missing Samples</option>
                    <option value="Not Satisfied with Purchase">Not Satisfied with Purchase</option>
                    <option value="Incorrect Data">Incorrect Data</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-1 text-gray-700">
                    Message <span className="text-gray-400">(max 500 characters)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    maxLength={500}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#002676]"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#1b3c84] hover:bg-[#002676] text-white font-semibold px-6 py-2 rounded-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center text-gray-700 space-y-4">
              <h2 className="text-3xl font-bold text-[#002676]">Thank you!</h2>
              <p className="text-lg">We&apos;ve received your message.</p>
              <p>We&apos;ll get back to you shortly.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactPage;
