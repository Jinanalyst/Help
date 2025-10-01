import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage } from 'siwe'
import { cookies } from 'next/headers'
import { signWalletJwt, setWalletCookie } from '@/lib/wallet-session'

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json()
    if (!message || !signature) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const domain = req.headers.get('host') || ''
    const nonce = cookies().get('siwe_nonce')?.value
    if (!nonce) return NextResponse.json({ error: 'Missing nonce' }, { status: 400 })

    const siwe = new SiweMessage(message)
    const result = await siwe.verify({ signature, domain, nonce })
    if (!result.success) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    }

    const token = signWalletJwt(siwe.address)
    setWalletCookie(token)
    cookies().set({ name: 'siwe_nonce', value: '', path: '/', maxAge: 0 })
    return NextResponse.json({ ok: true, address: siwe.address.toLowerCase() })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


