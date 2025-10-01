'use client'

import AuthButtons from '@/components/login/AuthButtons'

export default function LoginPage() {
  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h1 style={{ marginBottom: 8 }}>Sign in</h1>
      <p style={{ color: '#5f6368', marginBottom: 24 }}>
        We only use your email for authentication. You can sign out any time.
      </p>
      <AuthButtons />
    </div>
  )
}


