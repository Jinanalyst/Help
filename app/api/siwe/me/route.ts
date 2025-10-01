import { NextResponse } from 'next/server'
import { getWalletAddressFromCookie } from '@/lib/wallet-session'

export async function GET() {
  const address = getWalletAddressFromCookie()
  return NextResponse.json({ address })
}


