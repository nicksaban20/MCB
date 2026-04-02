'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../navbar/page'

type Ticket = {
  id: string
  subject: string
  message: string
  status: string
  created_at: string
  order_id?: string
}

export default function SupportPage() {
  const supabase = createClient()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setTickets(data)
    }
    load()
  }, [submitted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim() || !user) return
    setSubmitting(true)

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject,
      message,
      order_id: orderId || null,
      status: 'open',
    })

    if (error) {
      alert('Failed to submit ticket: ' + error.message)
    } else {
      setSubject('')
      setMessage('')
      setOrderId('')
      setSubmitted(!submitted)
    }
    setSubmitting(false)
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar profilePicUrl="" user={null} />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Support</h1>
        <p className="text-gray-500 mb-8">Have a question about your results or need help? Submit a ticket and our staff will get back to you.</p>

        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-6 mb-10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID (optional)</label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="If this is about a specific order"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail"
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#003262] text-white rounded-lg hover:bg-[#00254a] transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-400 text-sm">No support tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{ticket.subject}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
                  {ticket.order_id && ` — Order #${ticket.order_id}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
