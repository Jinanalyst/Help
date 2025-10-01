import { NextResponse } from 'next/server'
import { clearWalletCookie } from '@/lib/wallet-session'

export async function POST() {
  clearWalletCookie()
  return NextResponse.json({ ok: true })
}


