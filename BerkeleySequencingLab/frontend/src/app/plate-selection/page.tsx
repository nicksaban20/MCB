import { redirect } from 'next/navigation'

export default function LegacyPlateSelectionRedirect() {
  redirect('/admin/plates')
}
