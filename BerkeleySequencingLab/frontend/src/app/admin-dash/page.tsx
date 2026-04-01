import { redirect } from 'next/navigation'

export default function LegacyAdminDashRedirect() {
  redirect('/admin')
}
