'use client'

import SearchBox from '@/components/SearchBox'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleAskClick = () => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/login?returnUrl=%2Fask')
    } else {
      router.push('/ask')
    }
  }

  const handleSignLink = () => {
    if (!isAuthenticated) {
      router.push('/login')
    } else {
      router.push('/account')
    }
  }

  return (
    <main className="landing">
      <header className="landing-header">HELP</header>
      <section className="landing-hero">
        <Image src="/assets/help-sharp-logo.svg" alt="Help Logo" className="hero-logo" width={96} height={96} />
        <h1>Find and share knowledge to help others</h1>
        <p>Search the web, explore trusted answers, and contribute your expertise.</p>
        <div className="search-wrapper">
          <SearchBox />
        </div>
        <div className="actions">
          <button className="primary-btn" onClick={handleAskClick} disabled={loading}>
            Ask a question
          </button>
          <button className="link-btn" onClick={handleSignLink}>
            {isAuthenticated ? 'Go to your account' : 'Sign in to share knowledge'}
          </button>
        </div>
      </section>
    </main>
  )
}

