'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import SearchBox from '@/components/SearchBox'

interface WebResult {
  title: string
  url: string
  snippet?: string
  source?: string
}

interface FollowUp {
  label: string
}

interface QnaEntry {
  id: string
  title: string
  body: string
  tags: string[]
  upvotes: number
  createdAt: string
  answers: Array<{ id: string; body: string; author?: string; createdAt: string; upvotes: number; accepted?: boolean }>
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const query = searchParams.get('q') || ''

  const [loading, setLoading] = useState(false)
  const [webResults, setWebResults] = useState<WebResult[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [qnaLoading, setQnaLoading] = useState(false)
  const [qnaEntries, setQnaEntries] = useState<QnaEntry[]>([])
  const [askOpen, setAskOpen] = useState(false)
  const [askTitle, setAskTitle] = useState('')
  const [askBody, setAskBody] = useState('')
  const [askTags, setAskTags] = useState('')
  const [askError, setAskError] = useState('')

  useEffect(() => {
    if (!query) return

    const controller = new AbortController()
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setWebResults(data.results || [])
        setFollowUps((data.followUps || []).map((label: string) => ({ label })))
      } catch (err) {
        if (controller.signal.aborted) return
        console.error(err)
        setWebResults([])
        setFollowUps([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [query])

  useEffect(() => {
    if (!query) return
    const controller = new AbortController()

    const fetchQna = async () => {
      setQnaLoading(true)
      try {
        const res = await fetch(`/api/qna?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        if (!res.ok) throw new Error('Q&A fetch failed')
        const data = await res.json()
        setQnaEntries(data.entries || [])
      } catch (err) {
        if (controller.signal.aborted) return
        console.error(err)
        setQnaEntries([])
      } finally {
        if (!controller.signal.aborted) setQnaLoading(false)
      }
    }

    fetchQna()
    return () => controller.abort()
  }, [query])

  const summary = useMemo(() => {
    if (!webResults.length) return ''
    const fragments = webResults.slice(0, 3).map(result => result.snippet ?? '')
    const combined = fragments.join(' ') || query
    return combined
  }, [webResults, query])

  const handleFollowUp = (label: string) => {
    const target = `/search?q=${encodeURIComponent(label)}`
    if (pathname === '/search') {
      router.replace(target)
    } else {
      router.push(target)
    }
  }

  const handleAskSubmit = async () => {
    setAskError('')
    if (!askTitle.trim()) {
      setAskError('Title is required.')
      return
    }

    try {
      const res = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: askTitle.trim(),
          body: askBody.trim(),
          tags: askTags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/search?q=${query}`)}`)
        return
      }

      if (!res.ok) throw new Error('Failed to post question')

      setAskOpen(false)
      setAskTitle('')
      setAskBody('')
      setAskTags('')
      const data = await res.json()
      setQnaEntries(prev => [data.entry, ...prev])
    } catch (err) {
      console.error(err)
      setAskError('Could not post your question. Please try again later.')
    }
  }

  return (
    <div className="search-page">
      <header className="search-sticky-header">
        <div className="search-sticky-inner">
          <SearchBox initialQuery={query} />
        </div>
      </header>

      <main className="search-main">
        <section className="internet-answer">
          <div className="section-title">Internet answer</div>
          {loading ? (
            <div className="loading-block">Synthesizing web results...</div>
          ) : webResults.length ? (
            <article className="answer-card">
              <p className="answer-summary">{summary}</p>
              <div className="answer-citations">
                {webResults.slice(0, 6).map((result, idx) => (
                  <a key={result.url} href={`#source-${idx}`} className="citation-badge">
                    {String.fromCharCode(9312 + idx)}
                  </a>
                ))}
              </div>
            </article>
          ) : (
            <div className="empty-answer">We couldn&apos;t find fresh web results for this query. Try a different phrasing.</div>
          )}
        </section>

        <section className="sources-section">
          <div className="section-title">Sources</div>
          <div className="sources-grid">
            {webResults.map((result, idx) => (
              <div key={result.url} className="source-card" id={`source-${idx}`}>
                <div className="source-title">{result.title}</div>
                {result.source && <div className="source-domain">{result.source}</div>}
                <p className="source-snippet">{result.snippet || 'No preview available.'}</p>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="source-link">Open ↗</a>
              </div>
            ))}
            {!webResults.length && (
              <div className="source-card muted">No sources to show yet.</div>
            )}
          </div>
        </section>

        {!!followUps.length && (
          <section className="followups-section">
            <div className="section-title">Follow-up questions</div>
            <div className="followups-chips">
              {followUps.map(({ label }) => (
                <button key={label} className="chip" onClick={() => handleFollowUp(label)}>
                  {label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="qna-section">
          <div className="section-header">
            <div>
              <div className="section-title">Community Q&amp;A about “{query}”</div>
              <p className="section-subtitle">See what the community is asking and contribute your expertise.</p>
            </div>
            <button className="ask-button" onClick={() => setAskOpen(true)}>Ask this question</button>
          </div>

          {qnaLoading ? (
            <div className="loading-block">Loading community discussions...</div>
          ) : qnaEntries.length ? (
            <div className="qna-feed">
              {qnaEntries.map(entry => (
                <article key={entry.id} className="qna-card">
                  <div className="qna-meta">
                    <span className="qna-upvotes">▲ {entry.upvotes}</span>
                    <span className="qna-timestamp">{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="qna-title">{entry.title}</h3>
                  <p className="qna-body">{entry.body || 'No description provided.'}</p>
                  <div className="qna-tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="tag-chip">#{tag}</span>
                    ))}
                  </div>
                  {entry.answers.length > 0 ? (
                    <div className="qna-answer-preview">
                      <div className="answer-header">
                        Best answer · {entry.answers[0].author || 'Anonymous'}
                      </div>
                      <p>{entry.answers[0].body}</p>
                    </div>
                  ) : (
                    <div className="qna-empty-answer">No answers yet — be the first to share what you know.</div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-answer">No community posts yet. Be the first to ask!</div>
          )}
        </section>
      </main>

      {askOpen && (
        <div className="ask-overlay" role="dialog" aria-modal="true">
          <div className="ask-modal">
            <header>
              <h2>Ask the community</h2>
              <button onClick={() => setAskOpen(false)} aria-label="Close">×</button>
            </header>
            <div className="ask-body">
              <label>
                Title
                <input value={askTitle} onChange={e => setAskTitle(e.target.value)} placeholder="Summarize your question" maxLength={120} />
              </label>
              <label>
                Details (optional)
                <textarea value={askBody} onChange={e => setAskBody(e.target.value)} rows={4} placeholder="Give more context so others can help" />
              </label>
              <label>
                Tags (comma separated)
                <input value={askTags} onChange={e => setAskTags(e.target.value)} placeholder="e.g. javascript, react" />
              </label>
              {askError && <div className="ask-error">{askError}</div>}
            </div>
            <footer>
              <button className="ghost" onClick={() => setAskOpen(false)}>Cancel</button>
              <button className="primary" onClick={handleAskSubmit}>Post question</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
