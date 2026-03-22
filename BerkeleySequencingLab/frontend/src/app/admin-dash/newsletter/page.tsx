'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../navbar/page'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/context/ToastContext'
import { sendAnnouncementEmail } from '../../actions/newsletter'
import { isAdmin } from '@/utils/admin'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import { User } from '@supabase/supabase-js'

export default function AdminNewsletterPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
      setLoading(false)
    }
    init()
  }, [])

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      showToast('Please fill in subject and body', 'warning')
      return
    }

    if (!confirm('Send this newsletter to all active subscribers?')) return

    setSending(true)
    const htmlBody = await marked(body)
    const { success, error, sent } = await sendAnnouncementEmail(subject, htmlBody)

    if (success) {
      showToast(`Newsletter sent to ${sent} subscribers!`, 'success')
      setSubject('')
      setBody('')
    } else {
      showToast(error || 'Failed to send', 'error')
    }
    setSending(false)
  }

  if (loading) return null

  return (
    <>
      <Navbar profilePicUrl="" user={user} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#003262] mb-6">Newsletter Blast</h1>

          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject line..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003262]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body <span className="text-gray-400">(Markdown supported)</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your newsletter content here... (Markdown supported)"
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#003262]"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-[#003262] text-[#003262] rounded-lg hover:bg-gray-50 transition text-sm"
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-6 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00204a] transition text-sm disabled:bg-gray-400"
              >
                {sending ? 'Sending...' : 'Send Newsletter'}
              </button>
            </div>

            {showPreview && body && (
              <div className="mt-4 border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Preview:</h3>
                <div className="border-t pt-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{subject || '(No subject)'}</h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: marked(body) as string }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
