// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { generateNonce } from 'siwe'
import { cookies } from 'next/headers'

export async function GET() {
  const nonce = generateNonce()
  cookies().set({
    name: 'siwe_nonce',
    value: nonce,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  })
  return NextResponse.json({ nonce })
}


