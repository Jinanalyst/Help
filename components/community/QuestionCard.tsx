'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface QuestionCardProps {
  question: any
  userId: string | null
  onAction: (action: string) => void
}

export default function QuestionCard({ question, userId, onAction }: QuestionCardProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(question.user_liked || false)
  const [likeCount, setLikeCount] = useState(question.like_count || 0)
  const [bookmarked, setBookmarked] = useState(question.user_bookmarked || false)
  const [upvoted, setUpvoted] = useState(question.user_upvoted || false)
  const [downvoted, setDownvoted] = useState(question.user_downvoted || false)
  const [voteScore, setVoteScore] = useState(question.vote_score || 0)

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) {
      onAction('like')
      return
    }

    // Optimistic update
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)

    try {
      await fetch(`/api/community/questions/${question.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !liked, userId }),
      })
    } catch (error) {
      // Revert on error
      setLiked(liked)
      setLikeCount(question.like_count)
    }
  }

  const handleVote = async (type: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) {
      onAction('vote')
      return
    }

    const wasUpvoted = upvoted
    const wasDownvoted = downvoted
    
    // Optimistic update
    if (type === 'up') {
      if (upvoted) {
        setUpvoted(false)
        setVoteScore(prev => prev - 1)
      } else {
        setUpvoted(true)
        setDownvoted(false)
        setVoteScore(prev => prev + (downvoted ? 2 : 1))
      }
    } else {
      if (downvoted) {
        setDownvoted(false)
        setVoteScore(prev => prev + 1)
      } else {
        setDownvoted(true)
        setUpvoted(false)
        setVoteScore(prev => prev - (upvoted ? 2 : 1))
      }
    }

    try {
      await fetch(`/api/community/questions/${question.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId }),
      })
    } catch (error) {
      // Revert on error
      setUpvoted(wasUpvoted)
      setDownvoted(wasDownvoted)
      setVoteScore(question.vote_score)
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!userId) {
      onAction('bookmark')
      return
    }

    setBookmarked(!bookmarked)

    try {
      await fetch(`/api/community/questions/${question.id}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: !bookmarked, userId }),
      })
    } catch (error) {
      setBookmarked(bookmarked)
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diff = now.getTime() - posted.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return posted.toLocaleDateString('ko-KR')
  }

  return (
    <div 
      className="question-card"
      onClick={() => router.push(`/question/${question.id}`)}
    >
      {/* Header */}
      <div className="card-header">
        <span className="card-tag">{question.category || '정보'}</span>
        <span className="card-meta">
          {question.source || '블룸버그'} · {formatTime(question.created_at)}
        </span>
      </div>

      {/* Title & Excerpt */}
      <h3 className="card-title">{question.title}</h3>
      {question.description && (
        <p className="card-excerpt">{question.description}</p>
      )}

      {/* Related Tickers */}
      {question.tags && question.tags.length > 0 && (
        <div className="card-tickers">
          <span className="ticker-label">관련 기업</span>
          {question.tags.map((tag: string, i: number) => (
            <span key={i} className="ticker-chip">{tag}</span>
          ))}
        </div>
      )}

      {/* Actions Footer */}
      <div className="card-actions">
        <button
          className={`action-btn ${liked ? 'active' : ''}`}
          onClick={handleLike}
          aria-label="좋아요"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M8 14s-4-2.5-6-5.5C1 6 2 4 4 4c1.5 0 3 1 4 2 1-1 2.5-2 4-2 2 0 3 2 2 4.5-2 3-6 5.5-6 5.5z"/>
          </svg>
          <span>{likeCount > 0 ? likeCount : ''}</span>
        </button>

        <Link
          href={`/question/${question.id}#comments`}
          className="action-btn"
          onClick={(e) => e.stopPropagation()}
          aria-label="댓글"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-3 3v-3H4a2 2 0 0 1-2-2V4z"/>
          </svg>
          <span>{question.comment_count > 0 ? question.comment_count : ''}</span>
        </Link>

        <button className="action-btn" aria-label="공유">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 8.5l5-2M5.5 7.5l5 2"/>
          </svg>
        </button>

        <div className="vote-group">
          <button
            className={`action-btn vote-btn ${upvoted ? 'active-up' : ''}`}
            onClick={(e) => handleVote('up', e)}
            aria-label="추천"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3l3 6H5l3-6z"/>
            </svg>
          </button>
          <span className="vote-count">{voteScore}</span>
          <button
            className={`action-btn vote-btn ${downvoted ? 'active-down' : ''}`}
            onClick={(e) => handleVote('down', e)}
            aria-label="비추천"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 13L5 7h6l-3 6z"/>
            </svg>
          </button>
        </div>

        <button
          className={`action-btn ${bookmarked ? 'active' : ''}`}
          onClick={handleBookmark}
          aria-label="북마크"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M3 2h10v12l-5-3-5 3V2z"/>
          </svg>
        </button>

        <div className="card-views">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"/>
            <circle cx="8" cy="8" r="2"/>
          </svg>
          <span>조회 {question.view_count || 21}</span>
        </div>
      </div>
    </div>
  )
}

