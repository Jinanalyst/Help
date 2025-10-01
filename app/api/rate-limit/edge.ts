// Simple in-memory rate limiter for Edge-compatible handlers (development only)
// For production, use a KV store (Upstash Redis, Vercel KV, etc.)

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetMs: number
}

const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetMs: windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: entry.resetAt - now }
  }

  entry.count += 1
  store.set(key, entry)
  return { allowed: true, remaining: limit - entry.count, resetMs: entry.resetAt - now }
}


