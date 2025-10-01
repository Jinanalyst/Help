// Runtime assertion for required environment variables
if (process.env.NODE_ENV !== 'production') {
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.warn('[WARN] SUPABASE_JWT_SECRET is missing. Auth may fail.')
  }
  if (!process.env.WALLET_JWT_SECRET) {
    console.warn('[WARN] WALLET_JWT_SECRET is missing. Wallet auth may fail.')
  }
}

export function getSupabaseJwtSecret(): string {
  const secret = process.env.SUPABASE_JWT_SECRET
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not set')
  }
  return secret
}

export function getWalletJwtSecret(): string {
  const secret = process.env.WALLET_JWT_SECRET
  if (!secret) {
    throw new Error('WALLET_JWT_SECRET is not set')
  }
  return secret
}
