// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { clearWalletCookie } from '@/lib/wallet-session'

export async function POST() {
  clearWalletCookie()
  return NextResponse.json({ ok: true })
}


