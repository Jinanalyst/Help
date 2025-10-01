'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import QuestionCard from '@/components/community/QuestionCard'
import FilterChips from '@/components/community/FilterChips'
import SortBar from '@/components/community/SortBar'
import QuestionSkeleton from '@/components/community/QuestionSkeleton'
import EmptyState from '@/components/community/EmptyState'

const FILTERS = [
  'All', 'Breaking', 'Summary', 'Insight', 'Analysis', 
  'Crypto', 'Macro', 'Energy', 'Important', 'Earnings'
]

const SORTS = ['Latest', 'Hot', 'Most Voted'] as const
type SortType = typeof SORTS[number]

export default function CommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sort, setSort] = useState<SortType>('Latest')
  const [totalCount, setTotalCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id || null)
    })
  }, [])

  const fetchQuestions = useCallback(async (pageNum: number, reset = false) => {
    try {
      const limit = 10
      const offset = pageNum * limit
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sort: sort.toLowerCase().replace(' ', '_'),
      })
      
      if (search) params.append('q', search)
      if (activeFilter !== 'All') params.append('filter', activeFilter)

      const res = await fetch(`/api/community/questions?${params}`)
      const data = await res.json()

      if (reset) {
        setQuestions(data.questions || [])
      } else {
        setQuestions(prev => [...prev, ...(data.questions || [])])
      }
      
      setTotalCount(data.total || 0)
      setHasMore((data.questions?.length || 0) === limit)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch questions:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [search, activeFilter, sort])

  useEffect(() => {
    setLoading(true)
    setPage(0)
    fetchQuestions(0, true)
  }, [search, activeFilter, sort])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchQuestions(nextPage, false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, page, fetchQuestions])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setPage(0)
    await fetchQuestions(0, true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const q = formData.get('q') as string
    setSearch(q)
  }

  return (
    <div className="community-page">
      {/* Top Search Bar */}
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form-large">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="뉴스, 기업명, 티커를 검색해 주세요 (예: 엔비디아, NVDA)"
            className="search-input-large"
          />
          <button type="submit" className="search-button-large">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM18 18l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </form>
      </div>

      {/* Filter Chips */}
      <FilterChips
        filters={FILTERS}
        active={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Sort Bar */}
      <SortBar
        sorts={SORTS}
        active={sort}
        onChange={setSort}
        totalCount={totalCount}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Feed */}
      <div className="feed-container">
        {loading && questions.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => <QuestionSkeleton key={i} />)
        ) : questions.length === 0 ? (
          <EmptyState
            title="질문이 없습니다"
            description="첫 번째 질문을 남겨보세요"
            actionText="질문하기"
            onAction={() => router.push('/ask')}
          />
        ) : (
          <>
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                userId={userId}
                onAction={(action) => {
                  if (!userId) {
                    router.push(`/login?returnUrl=/community`)
                  }
                }}
              />
            ))}
            
            {hasMore && (
              <div ref={observerTarget} className="observer-target">
                {loading && <QuestionSkeleton />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

