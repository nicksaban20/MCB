'use client'

import { useEffect, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  variant: ToastVariant
  onClose: () => void
  duration?: number
}

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-100 border-green-400 text-green-800',
  error: 'bg-red-100 border-red-400 text-red-800',
  info: 'bg-blue-100 border-blue-400 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
}

const variantIcons: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u2139',
  warning: '!',
}

export default function Toast({ message, variant, onClose, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 ${
        variantStyles[variant]
      } ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
    >
      <span className="font-bold text-lg">{variantIcons[variant]}</span>
      <p className="text-sm flex-1">{message}</p>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }} className="text-lg font-bold opacity-60 hover:opacity-100">
        &times;
      </button>
    </div>
  )
}
