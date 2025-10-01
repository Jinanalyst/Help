import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/header.css'
import '@/styles/search.css'
import '@/styles/ask.css'
import '@/styles/community.css'
import '@/styles/question-detail.css'
import HeaderBar from '@/components/HeaderBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Help - Help People With Your Knowledge',
  description: 'A community platform to help people with your knowledge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <HeaderBar />
        <main style={{ paddingTop: '60px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
