'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface AppsGridProps {
  onClose?: () => void
}

interface AppLink {
  name: string
  url: string
  icon: string
  description: string
}

const apps: AppLink[] = [
  {
    name: 'Search',
    url: '/search',
    icon: '🔍',
    description: 'Find help and answers'
  },
  {
    name: 'Home',
    url: '/',
    icon: '🏠',
    description: 'Homepage'
  },
  {
    name: 'Profile',
    url: '/profile',
    icon: '👤',
    description: 'Your account and settings'
  },
  {
    name: 'History',
    url: '/history',
    icon: '📚',
    description: 'Your search history'
  },
  {
    name: 'Assists',
    url: '/assists',
    icon: '💡',
    description: 'Your recent assists'
  },
  {
    name: 'Community',
    url: '/community',
    icon: '👥',
    description: 'Connect with others'
  },
  {
    name: 'Ask',
    url: '/ask',
    icon: '❓',
    description: 'Ask for help'
  },
  {
    name: 'Docs',
    url: '/docs',
    icon: '📖',
    description: 'Documentation'
  },
  {
    name: 'Settings',
    url: '/settings',
    icon: '⚙️',
    description: 'App preferences'
  },
  
]

export default function AppsGrid({ onClose }: AppsGridProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
    if (onClose) onClose()
  }

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
        if (onClose) onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        if (onClose) onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  return (
    <div className="apps-root" ref={panelRef}>
      <button
        className="apps-trigger"
        onClick={() => setOpen(!open)}
        aria-label="Apps"
        aria-expanded={open}
      >
        <span className="apps-dots" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <i key={i} />
          ))}
        </span>
      </button>
      {open && (
        <div className="apps-grid-panel" role="dialog" aria-label="Apps menu">
          <div className="apps-grid" role="menu">
            {apps.map((app) => (
              <Link
                key={app.name}
                href={app.url}
                className="app-item"
                onClick={handleClose}
                title={app.description}
                role="menuitem"
              >
                <div className="app-icon">{app.icon}</div>
                <div className="app-name">{app.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
