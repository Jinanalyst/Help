'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { checkAuthRateLimit } from '@/lib/auth'

export default function AuthButtons() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const handleOAuth = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    setError('')
    if (!checkAuthRateLimit(`${provider}-signin`, 5, 60000)) {
      setError('Too many attempts. Please try again in a minute.')
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const returnUrl = params.get('returnUrl') || '/account'
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}${returnUrl}` },
      })
    } catch (e) {
      setError('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // SIWE Wallet login (MetaMask / EIP-1193)
  const handleWalletLogin = async () => {
    try {
      setError('')
      setLoading(true)
      const eth = (window as any).ethereum
      if (!eth) {
        setError('No wallet found. Please install MetaMask.')
        return
      }

      const nonceRes = await fetch('/api/siwe/nonce')
      const { nonce } = await nonceRes.json()

      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      const chainIdHex: string = await eth.request({ method: 'eth_chainId' })
      const chainId = parseInt(chainIdHex, 16)

      const domain = window.location.host
      const uri = window.location.origin
      const message = [
        `${domain} wants you to sign in with your Ethereum account:`,
        `${address}`,
        '',
        `URI: ${uri}`,
        `Version: 1`,
        `Chain ID: ${chainId}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`,
      ].join('\n')

      const signature = await eth.request({
        method: 'personal_sign',
        params: [message, address],
      })

      const verify = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      })

      if (!verify.ok) {
        const { error } = await verify.json().catch(() => ({ error: 'Wallet sign-in failed' }))
        setError(error || 'Wallet sign-in failed')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const returnUrl = params.get('returnUrl') || '/account'
      window.location.href = returnUrl
    } catch (e) {
      setError('Wallet sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!checkAuthRateLimit(`otp-${email}`, 5, 60000)) {
      setError('Too many attempts. Please try again in a minute.')
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const returnUrl = params.get('returnUrl') || '/account'
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}${returnUrl}` },
      })
      if (error) throw error
      setMessage('Check your email for a sign-in link.')
    } catch (e) {
      setError('Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-content" style={{ padding: 0 }}>
      {error && <div className="auth-error" role="alert">{error}</div>}
      {message && <div className="auth-success" role="status">{message}</div>}

      <div className="auth-oauth-buttons">
        <button
          className="auth-button auth-button-google"
          onClick={() => handleOAuth('google')}
          disabled={loading}
        >
          Continue with Google
        </button>
        <button
          className="auth-button auth-button-github"
          onClick={() => handleOAuth('github')}
          disabled={loading}
        >
          Continue with GitHub
        </button>
        <button
          className="auth-button auth-button-linkedin"
          onClick={() => handleOAuth('linkedin_oidc')}
          disabled={loading}
        >
          Continue with LinkedIn
        </button>
        <button
          className="auth-button auth-button-wallet"
          onClick={handleWalletLogin}
          disabled={loading}
        >
          Connect Wallet
        </button>
      </div>

      <div className="auth-divider"><span>or</span></div>

      <form className="auth-form" onSubmit={handleMagicLink}>
        <div className="auth-form-group">
          <label htmlFor="email" className="auth-label">Email address</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="auth-button auth-button-primary"
          disabled={loading || !email}
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      <p className="auth-footer-text">
        We only use your email for authentication. You can sign out any time.
      </p>
    </div>
  )
}



