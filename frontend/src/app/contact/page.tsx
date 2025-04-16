'use client';

import { useState } from 'react';
import Navbar from "../navbar/page";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issueType: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

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

  return (
    <>
      <Navbar profilePicUrl={""} />
      <div className="flex min-h-screen">
        

        {/* Right: Illustration */}
        <div className="w-1/2 bg-white flex items-center justify-center rounded-lg">
          <img
            src="/assets/750.jpg" // Make sure this exists in /public
            alt="Contact Illustration"
            className="max-w-full max-h-[90%] object-contain"
          />
        </div>
        {/*Left Form */}
        <div className="w-1/2 bg-white p-10 flex flex-col justify-center">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-[#002676] mb-6">Feedback</h2>
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
                  <label htmlFor="Email" className="block text-sm font-semibold mb-1 text-gray-700">
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
                    <option value="option 1">Missing Samples</option>
                    <option value="option 2">Not Satisfied with Purchase</option>
                    <option value="option 3">Incorrect Data</option>
                    <option value="option 4">General Feedback</option>
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
                    className="bg-[#1b3c84] hover:bg-[#002676] text-white font-semibold px-6 py-2 rounded-md transition"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center text-gray-700 space-y-4">
              <h2 className="text-3xl font-bold text-[#002676]">Thank you!</h2>
              <p className="text-lg">We’ve received your message.</p>
              <p>We’ll get back to you shortly.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactPage;
