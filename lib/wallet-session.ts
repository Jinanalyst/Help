import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const COOKIE = 'wallet_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function signWalletJwt(address: string) {
  const secret = process.env.WALLET_JWT_SECRET!
  return jwt.sign({ sub: address.toLowerCase() }, secret, { expiresIn: MAX_AGE })
}

export function verifyWalletJwt(token?: string) {
  try {
    if (!token) return null
    const secret = process.env.WALLET_JWT_SECRET!
    const decoded = jwt.verify(token, secret) as { sub: string }
    return decoded?.sub ?? null
  } catch {
    return null
  }
}

export function setWalletCookie(token: string) {
  cookies().set({
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearWalletCookie() {
  cookies().set({
    name: COOKIE,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function getWalletAddressFromCookie(): string | null {
  const token = cookies().get(COOKIE)?.value
  return verifyWalletJwt(token)
}


