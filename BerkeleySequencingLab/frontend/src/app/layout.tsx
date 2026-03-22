import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { UserProvider } from '@/context/UserContext'
import { ToastProvider } from '@/context/ToastContext'
import ErrorBoundary from '@/components/ErrorBoundary'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Berkeley Sequencing Lab",
  description: "UC Berkeley DNA Sequencing Facility - DNA sequencing made easier, faster, and more trustworthy",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch {
    // Supabase not configured — continue without session
  }

  return (
    <html lang="en">
      <body>
        <UserProvider initialSession={session}>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  )
}
