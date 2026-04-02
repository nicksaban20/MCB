import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { UserContext, UserProvider } from '@/context/UserContext'
import AnnouncementsTicker from '@/components/AnnouncementsTicker'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Berkeley Sequencing Lab",
  description: "UC Berkeley DNA Sequencing Facility",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body>
        <AnnouncementsTicker />
        <UserProvider initialSession={session}>
        {children}
        </UserProvider>
      </body>
    </html>
  )
}
