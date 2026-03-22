'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/app/actions/newsletter'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    const result = await subscribeToNewsletter(email)
    if (result.success) {
      setStatus('success')
      setMessage('Subscribed! Check your inbox for updates.')
      setEmail('')
    } else {
      setStatus('error')
      setMessage(result.error || 'Failed to subscribe. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-gray-700 font-semibold text-sm mb-2">Stay Updated</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003262]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-[#003262] text-white text-sm rounded-md hover:bg-[#00204a] transition disabled:bg-gray-400"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {status === 'success' && (
        <p className="text-green-600 text-xs mt-1">{message}</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-xs mt-1">{message}</p>
      )}
    </div>
  )
}
