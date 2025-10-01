'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { User, getUserInitials, signOut } from '@/lib/auth'

interface AvatarMenuProps {
  user: User | null
}

export default function AvatarMenu({ user }: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!open) return
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [open])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/'
    } catch (e) {
      console.error(e)
    }
  }

  if (!user) {
    return (
      <Link href="/login" className="header-signin-btn">
        Sign in
      </Link>
    )
  }

  return (
    <div className="avatar-root" ref={ref}>
      <button
        className="header-avatar-btn"
        onClick={() => setOpen(!open)}
        aria-label="Account"
        aria-expanded={open}
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name || 'User'} className="avatar-image" />
        ) : (
          <div className="avatar-initials" aria-hidden>
            {getUserInitials(user)}
          </div>
        )}
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <div className="user-menu-header">
            <div className="user-menu-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" />
              ) : (
                <div className="user-menu-initials">{getUserInitials(user)}</div>
              )}
            </div>
            <div className="user-menu-info">
              <div className="user-menu-name">{user.name || 'User'}</div>
              <div className="user-menu-email">{user.email}</div>
            </div>
          </div>
          <div className="user-menu-divider" />
          <div className="user-menu-items">
            <Link href="/account" className="user-menu-item" role="menuitem">Profile</Link>
            <Link href="/settings" className="user-menu-item" role="menuitem">Settings</Link>
          </div>
          <div className="user-menu-divider" />
          <div className="user-menu-items">
            <button className="user-menu-item" onClick={handleSignOut}>Sign out</button>
          </div>
        </div>
      )}
    </div>
  )
}



