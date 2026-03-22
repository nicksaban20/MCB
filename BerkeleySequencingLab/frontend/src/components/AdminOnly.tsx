'use client'

import { ReactNode } from 'react'
import { useUser } from '@/context/UserContext'
import { isAdmin } from '@/utils/admin'

export default function AdminOnly({ children }: { children: ReactNode }) {
  const { user } = useUser()
  if (!isAdmin(user)) return null
  return <>{children}</>
}
