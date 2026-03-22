'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../navbar/page'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../actions/announcements'
import { isAdmin } from '@/utils/admin'
import { useRouter } from 'next/navigation'
import type { Announcement } from '@/types'
import { User } from '@supabase/supabase-js'

export default function AdminAnnouncementsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'general' as Announcement['type'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true,
  })

  const supabase = createClient()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user || !isAdmin(data.user)) {
        router.push('/hero')
        return
      }
      setUser(data.user)
      await fetchAnnouncements()
      setLoading(false)
    }
    init()
  }, [])

  const fetchAnnouncements = async () => {
    const { data } = await getAllAnnouncements()
    if (data) setAnnouncements(data)
  }

  const resetForm = () => {
    setForm({ title: '', content: '', type: 'general', start_date: new Date().toISOString().split('T')[0], end_date: '', is_active: true })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      start_date: new Date(form.start_date).toISOString(),
      end_date: form.end_date ? new Date(form.end_date).toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }

    if (editingId) {
      const { success, error } = await updateAnnouncement(editingId, payload)
      if (success) { showToast('Announcement updated', 'success'); resetForm(); await fetchAnnouncements() }
      else showToast(error || 'Update failed', 'error')
    } else {
      const { success, error } = await createAnnouncement(payload)
      if (success) { showToast('Announcement created', 'success'); resetForm(); await fetchAnnouncements() }
      else showToast(error || 'Creation failed', 'error')
    }
  }

  const handleEdit = (a: Announcement) => {
    setForm({
      title: a.title,
      content: a.content,
      type: a.type,
      start_date: a.start_date ? a.start_date.split('T')[0] : '',
      end_date: a.end_date ? a.end_date.split('T')[0] : '',
      is_active: a.is_active,
    })
    setEditingId(a.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    const { success } = await deleteAnnouncement(id)
    if (success) { showToast('Deleted', 'success'); await fetchAnnouncements() }
    else showToast('Delete failed', 'error')
  }

  if (loading) return null

  return (
    <>
      <Navbar profilePicUrl="" user={user} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#003262]">Manage Announcements</h1>
            <button
              onClick={() => { resetForm(); setShowForm(!showForm) }}
              className="px-4 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition text-sm"
            >
              {showForm ? 'Cancel' : 'Add Announcement'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 mb-6 space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
              <textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Announcement['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                  >
                    <option value="general">General</option>
                    <option value="deadline">Deadline</option>
                    <option value="event">Event</option>
                    <option value="closure">Closure</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mt-6 text-sm text-gray-700">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700" />
                </div>
              </div>
              <button type="submit" className="px-6 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition">
                {editingId ? 'Update' : 'Create'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className={`bg-white p-4 rounded-lg border ${a.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{a.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleEdit(a)} className="text-sm text-[#003262] hover:underline">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-sm text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-gray-500 text-center py-8">No announcements yet.</p>}
          </div>
        </div>
      </div>
    </>
  )
}
