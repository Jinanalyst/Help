'use client'

import { useState } from 'react'

interface QuestionActionsProps {
  questionId: string
  userId: string | null
  initialLiked?: boolean
  initialBookmarked?: boolean
  initialVoteScore?: number
  initialUpvoted?: boolean
  initialDownvoted?: boolean
  onAuthRequired: () => void
}

export default function QuestionActions({
  questionId,
  userId,
  initialLiked = false,
  initialBookmarked = false,
  initialVoteScore = 0,
  initialUpvoted = false,
  initialDownvoted = false,
  onAuthRequired
}: QuestionActionsProps) {
  const [liked, setLiked] = useState<boolean>(initialLiked)
  const [bookmarked, setBookmarked] = useState<boolean>(initialBookmarked)
  const [upvoted, setUpvoted] = useState<boolean>(initialUpvoted)
  const [downvoted, setDownvoted] = useState<boolean>(initialDownvoted)
  const [voteScore, setVoteScore] = useState<number>(initialVoteScore)
  const [following, setFollowing] = useState<boolean>(false)

  const handleLike = async () => {
    if (!userId) {
      onAuthRequired()
      return
    }

    setLiked(!liked)

    try {
      await fetch(`/api/community/questions/${questionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !liked, userId }),
      })
    } catch (error) {
      setLiked(liked)
    }
  }

  const handleBookmark = async () => {
    if (!userId) {
      onAuthRequired()
      return
    }

    setBookmarked(!bookmarked)

    try {
      await fetch(`/api/community/questions/${questionId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarked: !bookmarked, userId }),
      })
    } catch (error) {
      setBookmarked(bookmarked)
    }
  }

  const handleVote = async (type: 'up' | 'down') => {
    if (!userId) {
      onAuthRequired()
      return
    }

    const wasUpvoted = upvoted
    const wasDownvoted = downvoted

    if (type === 'up') {
      if (upvoted) {
        setUpvoted(false)
        setVoteScore((prev: number) => prev - 1)
      } else {
        setUpvoted(true)
        setDownvoted(false)
        setVoteScore((prev: number) => prev + (downvoted ? 2 : 1))
      }
    } else {
      if (downvoted) {
        setDownvoted(false)
        setVoteScore((prev: number) => prev + 1)
      } else {
        setDownvoted(true)
        setUpvoted(false)
        setVoteScore((prev: number) => prev - (upvoted ? 2 : 1))
      }
    }

    try {
      await fetch(`/api/community/questions/${questionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId }),
      })
    } catch (error) {
      setUpvoted(wasUpvoted)
      setDownvoted(wasDownvoted)
      setVoteScore(initialVoteScore)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/question/${questionId}`
    
    if (navigator.share) {
      try {
        await navigator.share({ url })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('링크가 복사되었습니다!')
    }
  }

  return (
    <div className="question-actions-bar">
      <div className="actions-left">
        <button
          className={`action-btn-large ${liked ? 'active' : ''}`}
          onClick={handleLike}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M8 14s-4-2.5-6-5.5C1 6 2 4 4 4c1.5 0 3 1 4 2 1-1 2.5-2 4-2 2 0 3 2 2 4.5-2 3-6 5.5-6 5.5z"/>
          </svg>
          좋아요
        </button>

        <button className="action-btn-large" onClick={handleShare}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM4 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5.5 8.5l5-2M5.5 7.5l5 2"/>
          </svg>
          공유
        </button>

        <button
          className={`action-btn-large ${bookmarked ? 'active' : ''}`}
          onClick={handleBookmark}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M3 2h10v12l-5-3-5 3V2z"/>
          </svg>
          북마크
        </button>
      </div>

      <div className="actions-right">
        <div className="vote-group-large">
          <button
            className={`vote-btn-large ${upvoted ? 'active-up' : ''}`}
            onClick={() => handleVote('up')}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3l3 6H5l3-6z"/>
            </svg>
          </button>
          <span className="vote-score-large">{voteScore}</span>
          <button
            className={`vote-btn-large ${downvoted ? 'active-down' : ''}`}
            onClick={() => handleVote('down')}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 13L5 7h6l-3 6z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

