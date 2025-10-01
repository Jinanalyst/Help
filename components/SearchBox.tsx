'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import '@/styles/search.css'

interface Suggestion {
  title: string
  source?: string
}

interface SearchBoxProps {
  onSearch?: (query: string) => void
  initialQuery?: string
}

export default function SearchBox({ onSearch, initialQuery = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&preview=1`)
        if (!res.ok) {
          setSuggestions([])
          setShowSuggestions(false)
          return
        }
        const data = await res.json()
        const mapped: Suggestion[] = (data.results || []).slice(0, 6).map((r: any) => ({
          title: r.title,
          source: r.source
        }))
        setSuggestions(mapped)
        setShowSuggestions(mapped.length > 0)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSearch = async (value?: string) => {
    const searchQuery = (value ?? query).trim()
    if (!searchQuery) return

    try {
      const existing = JSON.parse(localStorage.getItem('local_queries') || '[]')
      const newItem = { q: searchQuery, ts: new Date().toISOString() }
      localStorage.setItem('local_queries', JSON.stringify([newItem, ...existing].slice(0, 50)))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }

    try {
      await fetch('/api/log-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: searchQuery }),
      })
    } catch (error) {
      console.error('Error logging query:', error)
    }

    setShowSuggestions(false)
    setSelectedIndex(-1)

    onSearch?.(searchQuery)

    const target = `/search?q=${encodeURIComponent(searchQuery)}`
    if (pathname === '/search') {
      router.replace(target)
    } else {
      router.push(target)
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.title)
    handleSearch(suggestion.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  return (
    <div className="searchbox-wrapper">
      <form className="search-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="search-box">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search for help..."
            className="search-input"
            autoComplete="off"
            aria-label="Search input"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            role="combobox"
          />
          <button type="submit" className="search-button">Search</button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="suggestions-panel"
          role="listbox"
          aria-label="Search suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.title}-${index}`}
              className={index === selectedIndex ? 'selected' : ''}
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span>{suggestion.title}</span>
              {suggestion.source && <span className="suggestion-domain">{suggestion.source}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
