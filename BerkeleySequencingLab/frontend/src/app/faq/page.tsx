'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/context/ToastContext';
import type { FAQEntry } from '@/types';
import { getFAQEntries, createFAQEntry, updateFAQEntry, deleteFAQEntry } from '../actions/faq';
import { isAdmin } from '@/utils/admin';
import { User } from '@supabase/supabase-js';

const categories = ['All', 'Ordering', 'Sample Prep', 'Results', 'Billing', 'General'];

const defaultFormState = {
  question: '',
  answer: '',
  category: 'General',
  sort_order: 0,
  is_published: true,
};

export default function FAQPage() {
  const { showToast } = useToast();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [faqEntries, setFaqEntries] = useState<FAQEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState(defaultFormState);

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

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await getFAQEntries();
    if (error) {
      showToast(error, 'error');
    } else if (data) {
      setFaqEntries(data);
    }
  };

  const filteredEntries = faqEntries.filter((entry) => {
    const matchesCategory = activeCategory === 'All' || entry.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      entry.question.toLowerCase().includes(query) ||
      entry.answer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const openAddForm = () => {
    setFormData(defaultFormState);
    setEditingId(null);
    setShowAddForm(true);
  };

  const openEditForm = (entry: FAQEntry) => {
    setFormData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      sort_order: entry.sort_order,
      is_published: entry.is_published,
    });
    setEditingId(entry.id);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(defaultFormState);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'sort_order') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      showToast('Question and answer are required.', 'error');
      return;
    }

    if (editingId) {
      const { success, error } = await updateFAQEntry(editingId, formData);
      if (error) {
        showToast(`Failed to update FAQ: ${error}`, 'error');
      } else if (success) {
        showToast('FAQ entry updated successfully.', 'success');
        closeForm();
        fetchEntries();
      }
    } else {
      const { success, error } = await createFAQEntry(formData);
      if (error) {
        showToast(`Failed to create FAQ: ${error}`, 'error');
      } else if (success) {
        showToast('FAQ entry created successfully.', 'success');
        closeForm();
        fetchEntries();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ entry?')) return;

    const { success, error } = await deleteFAQEntry(id);
    if (error) {
      showToast(`Failed to delete FAQ: ${error}`, 'error');
    } else if (success) {
      showToast('FAQ entry deleted.', 'success');
      if (expandedId === id) setExpandedId(null);
      fetchEntries();
    }
  };

  if (loading) return null;

  const admin = isAdmin(user);

  return (
    <>
      <Navbar
        profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''}
        user={user}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-[#003262]">Frequently Asked Questions</h1>
            <p className="mt-2 text-gray-600">
              Find answers to common questions about our DNA sequencing services.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-700 bg-white shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#FDB515] text-[#003262]'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Admin: Add FAQ Button */}
          {admin && (
            <div className="flex justify-end mb-6">
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 px-5 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00254a] transition font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add FAQ
              </button>
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No FAQ entries found matching your criteria.
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpand(entry.id)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-semibold text-[#003262]">{entry.question}</h3>
                        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#003262]">
                          {entry.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Admin: Edit / Delete */}
                        {admin && (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditForm(entry)}
                              className="p-1.5 text-gray-400 hover:text-[#003262] transition"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                        {/* Chevron */}
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Answer */}
                    {isExpanded && (
                      <div className="px-6 pb-5 border-t border-gray-100">
                        <p className="pt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                          {entry.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal Form for Add / Edit */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-[#003262]">
                {editingId ? 'Edit FAQ Entry' : 'Add FAQ Entry'}
              </h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Question */}
              <div>
                <label htmlFor="question" className="block text-sm font-semibold text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-700"
                />
              </div>

              {/* Answer */}
              <div>
                <label htmlFor="answer" className="block text-sm font-semibold text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  rows={5}
                  value={formData.answer}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-700"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-700"
                >
                  {categories
                    .filter((c) => c !== 'All')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-semibold text-gray-700 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-700"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-[#003262] border-gray-300 rounded focus:ring-[#003262]"
                />
                <label htmlFor="is_published" className="text-sm font-semibold text-gray-700">
                  Published
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00254a] transition text-sm font-medium"
                >
                  {editingId ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
