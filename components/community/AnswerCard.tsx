'use client'

import { useState } from 'react'

interface AnswerCardProps {
  answer: any
  questionId: string
  userId: string | null
  onAuthRequired: () => void
}

export default function AnswerCard({ answer, questionId, userId, onAuthRequired }: AnswerCardProps) {
  const [upvoted, setUpvoted] = useState<boolean>(answer.user_upvoted || false)
  const [downvoted, setDownvoted] = useState<boolean>(answer.user_downvoted || false)
  const [voteScore, setVoteScore] = useState<number>(answer.vote_score || 0)
  const [showComments, setShowComments] = useState<boolean>(false)
  const [comments, setComments] = useState<any[]>(answer.comments || [])
  const [commentText, setCommentText] = useState<string>('')

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
      await fetch(`/api/community/answers/${answer.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, userId }),
      })
    } catch (error) {
      setUpvoted(wasUpvoted)
      setDownvoted(wasDownvoted)
      setVoteScore(answer.vote_score)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) {
      onAuthRequired()
      return
    }
    if (!commentText.trim()) return

    try {
      const res = await fetch(`/api/community/answers/${answer.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText, userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setComments([...comments, data.comment])
        setCommentText('')
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    }
  }

  const formatTime = (date: string) => {
    const posted = new Date(date)
    return posted.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="answer-card">
      <div className="answer-header">
        <div className="answer-author">
          <div className="author-avatar">
            {answer.author_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="author-info">
            <span className="author-name">{answer.author_name || '익명'}</span>
            <span className="answer-time">{formatTime(answer.created_at)}</span>
          </div>
        </div>
        {answer.is_accepted && (
          <span className="accepted-badge">✓ 채택된 답변</span>
        )}
      </div>

      <div className="answer-content markdown-content">
        {answer.content}
      </div>

      <div className="answer-actions">
        <div className="vote-group-inline">
          <button
            className={`vote-btn-inline ${upvoted ? 'active-up' : ''}`}
            onClick={() => handleVote('up')}
            aria-label="추천"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3l3 6H5l3-6z"/>
            </svg>
          </button>
          <span className="vote-count-inline">{voteScore}</span>
          <button
            className={`vote-btn-inline ${downvoted ? 'active-down' : ''}`}
            onClick={() => handleVote('down')}
            aria-label="비추천"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 13L5 7h6l-3 6z"/>
            </svg>
          </button>
        </div>

        <button
          className="comment-toggle-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-3 3v-3H4a2 2 0 0 1-2-2V4z"/>
          </svg>
          댓글 {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {comments.map((comment: any) => (
            <div key={comment.id} className="comment">
              <strong>{comment.author_name || '익명'}</strong>
              <span>{comment.content}</span>
              <time>{formatTime(comment.created_at)}</time>
            </div>
          ))}

          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <input
              type="text"
              placeholder={userId ? "댓글을 입력하세요..." : "로그인 후 댓글 작성"}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!userId}
            />
            <button type="submit" disabled={!commentText.trim() || !userId}>
              작성
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

