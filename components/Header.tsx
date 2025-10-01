'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, getCurrentUser } from '@/lib/auth'
import AppsGrid from './AppsGrid'
import UserMenu from './UserMenu'
import AuthModal from './AuthModal'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [showAppsGrid, setShowAppsGrid] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setShowUserMenu(false)
  }

  const handleSignInSuccess = () => {
    setShowAuthModal(false)
    loadUser()
  }

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <Link href="/" className="header-logo">
            <span className="logo-text">Help</span>
          </Link>

          {/* Spacer */}
          <div className="header-spacer" />

          {/* Right side actions */}
          <div className="header-actions">
            {/* Apps Grid Button */}
            <button
              className="header-icon-btn"
              onClick={() => setShowAppsGrid(!showAppsGrid)}
              aria-label="Apps"
              aria-expanded={showAppsGrid}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
            </button>

            {/* User Avatar/Sign In */}
            {loading ? (
              <div className="header-avatar skeleton" />
            ) : user ? (
              <button
                className="header-avatar-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Account menu"
                aria-expanded={showUserMenu}
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name || 'User avatar'} 
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-initials">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            ) : (
              <button
                className="header-signin-btn"
                onClick={() => setShowAuthModal(true)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* Apps Grid Panel */}
        {showAppsGrid && (
          <AppsGrid 
            onClose={() => setShowAppsGrid(false)} 
          />
        )}

        {/* User Menu Dropdown */}
        {showUserMenu && user && (
          <UserMenu 
            user={user}
            onClose={() => setShowUserMenu(false)}
            onSignOut={handleSignOut}
          />
        )}
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleSignInSuccess}
        />
      )}
    </>
  )
}
