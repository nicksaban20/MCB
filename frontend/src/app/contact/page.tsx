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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);

    //HANDLE SUBMIT, EMAIL STUFF HERE

    setFormData({
      name: '',
      email: '',
      issueType: 'general',
      message: '',
    });
  };

  return (
    <>
    <Navbar profilePicUrl={""} />
    <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-10 w-full text-gray-600 flex flex-col min-h-screen">
      <h2 className="text-2xl font-bold text-[#002676] mb-6">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <option value="option 1">option 1</option>
            <option value="option 2">option 2</option>
            <option value="option 3">option 3</option>
            <option value="option 4">option 4</option>
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
    </div>
    </>
  );
};

export default ContactPage;
