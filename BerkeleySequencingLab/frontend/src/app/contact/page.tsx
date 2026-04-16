'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/Navbar";
import { createClient } from '@/utils/supabase/client';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    // HANDLE SUBMIT/EMAIL LOGIC HERE
    setSubmitted(true);
  };

  if (loading) return null;

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-white pt-24">
        <div className="mx-auto flex w-full max-w-7xl flex-col-reverse gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-stretch lg:px-8 lg:py-10">
          <div className="flex-1 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {!submitted ? (
              <>
                <h2 className="mb-2 text-2xl font-bold text-[#002676] sm:text-3xl">Feedback</h2>
                <p className="mb-6 text-sm text-gray-600 sm:text-base">
                  Send a message to the lab team and we&apos;ll follow up as soon as possible.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6 text-gray-600">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002676]"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002676]"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="issueType" className="mb-1 block text-sm font-semibold text-gray-700">
                      Issue Type
                    </label>
                    <select
                      id="issueType"
                      name="issueType"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002676]"
                      value={formData.issueType}
                      onChange={handleChange}
                    >
                      <option value="option 1">Missing Samples</option>
                      <option value="option 2">Not Satisfied with Purchase</option>
                      <option value="option 3">Incorrect Data</option>
                      <option value="option 4">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1 block text-sm font-semibold text-gray-700">
                      Message <span className="text-gray-400">(max 500 characters)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      maxLength={500}
                      rows={5}
                      className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#002676]"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="w-full rounded-md bg-[#1b3c84] px-6 py-3 font-semibold text-white transition hover:bg-[#002676] sm:w-auto"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-12 text-center text-gray-700">
                <h2 className="text-3xl font-bold text-[#002676]">Thank you!</h2>
                <p className="text-lg">We&apos;ve received your message.</p>
                <p>We&apos;ll get back to you shortly.</p>
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl bg-[#0A215C] px-6 py-10 text-white sm:px-8 lg:min-h-[42rem]">
            <div className="grid w-full max-w-xl gap-6 lg:gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FDB515]">
                  Berkeley Sequencing Lab
                </p>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Reach the lab team with questions, concerns, or order follow-up.
                </h2>
                <p className="mt-4 text-sm text-blue-100 sm:text-base">
                  Use this page to report an issue, ask for clarification, or share feedback about your sequencing experience.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white/10 p-4 sm:p-6">
                <img
                  src="/assets/750.jpg"
                  alt="Contact Illustration"
                  className="h-full max-h-[24rem] w-full rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
