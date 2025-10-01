'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface AppsGridProps {}

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

export default function AppsGrid({}: AppsGridProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

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
                onClick={() => setOpen(false)}
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
