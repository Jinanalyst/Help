import { createClient } from './supabase'

export interface User {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  provider?: string
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) throw error
  return data
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) throw error
  return data
}

/**
 * Sign in with Email Magic Link (passwordless)
 */
export async function signInWithMagicLink(email: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  if (error) throw error
  return data
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) throw error
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    provider: user.app_metadata?.provider,
  }
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?'
  
  if (user.name) {
    const parts = user.name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.name.substring(0, 2).toUpperCase()
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase()
  }
  
  return '?'
}

/**
 * Rate limiting for auth actions
 */
const authRateLimits = new Map<string, number[]>()

export function checkAuthRateLimit(identifier: string, maxAttempts = 5, windowMs = 60000): boolean {
  const now = Date.now()
  const attempts = authRateLimits.get(identifier) || []
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < windowMs)
  
  if (recentAttempts.length >= maxAttempts) {
    return false // Rate limit exceeded
  }
  
  // Add new attempt
  recentAttempts.push(now)
  authRateLimits.set(identifier, recentAttempts)
  
  return true
}
