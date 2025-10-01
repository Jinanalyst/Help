'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AnswerEditor from '@/components/community/AnswerEditor'
import AnswerCard from '@/components/community/AnswerCard'
import QuestionActions from '@/components/community/QuestionActions'

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [answerSort, setAnswerSort] = useState<'votes' | 'latest'>('votes')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id || null)
    })
  }, [])

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/community/questions/${questionId}`)
        const data = await res.json()
        setQuestion(data.question)
        
        // Increment view count
        await fetch(`/api/community/questions/${questionId}/view`, { method: 'POST' })
      } catch (error) {
        console.error('Failed to fetch question:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchAnswers = async () => {
      try {
        const res = await fetch(`/api/community/questions/${questionId}/answers?sort=${answerSort}`)
        const data = await res.json()
        setAnswers(data.answers || [])
      } catch (error) {
        console.error('Failed to fetch answers:', error)
      }
    }

    fetchQuestion()
    fetchAnswers()
  }, [questionId, answerSort])

  const handleAnswerSubmit = async (content: string) => {
    if (!userId) {
      router.push(`/login?returnUrl=/question/${questionId}`)
      return
    }

    try {
      const res = await fetch(`/api/community/questions/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userId }),
      })

      if (res.ok) {
        const data = await res.json()
        setAnswers(prev => [data.answer, ...prev])
        return true
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
    return false
  }

  if (loading) {
    return (
      <div className="question-detail loading">
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
        <div className="skeleton-body"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="question-detail error">
        <h2>질문을 찾을 수 없습니다</h2>
        <button onClick={() => router.push('/community')}>목록으로 돌아가기</button>
      </div>
    )
  }

  return (
    <div className="question-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="breadcrumb">
          <button onClick={() => router.push('/community')}>← 커뮤니티</button>
        </div>
        
        <div className="detail-meta-row">
          <span className="detail-tag">{question.category || '정보'}</span>
          <div className="detail-meta">
            <span>{question.author_name || '익명'}</span>
            <span>·</span>
            <span>{new Date(question.created_at).toLocaleDateString('ko-KR')}</span>
            <span>·</span>
            <span>조회 {question.view_count || 0}</span>
          </div>
        </div>

        <h1 className="detail-title">{question.title}</h1>

        {question.tags && question.tags.length > 0 && (
          <div className="detail-tags">
            {question.tags.map((tag: string, i: number) => (
              <span key={i} className="tag-chip">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="detail-body">
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: question.description || '' }} />
      </div>

      {/* Actions */}
      <QuestionActions
        questionId={questionId}
        userId={userId}
        initialLiked={question.user_liked}
        initialBookmarked={question.user_bookmarked}
        initialVoteScore={question.vote_score}
        initialUpvoted={question.user_upvoted}
        initialDownvoted={question.user_downvoted}
        onAuthRequired={() => router.push(`/login?returnUrl=/question/${questionId}`)}
      />

      {/* Answers Section */}
      <div className="answers-section" id="answers">
        <div className="answers-header">
          <h2>{answers.length}개의 답변</h2>
          <div className="answer-sort">
            <button
              className={answerSort === 'votes' ? 'active' : ''}
              onClick={() => setAnswerSort('votes')}
            >
              추천순
            </button>
            <button
              className={answerSort === 'latest' ? 'active' : ''}
              onClick={() => setAnswerSort('latest')}
            >
              최신순
            </button>
          </div>
        </div>

        {/* Answer Editor */}
        <AnswerEditor onSubmit={handleAnswerSubmit} userId={userId} />

        {/* Answers List */}
        <div className="answers-list">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              questionId={questionId}
              userId={userId}
              onAuthRequired={() => router.push(`/login?returnUrl=/question/${questionId}#answers`)}
            />
          ))}
        </div>

        {answers.length === 0 && (
          <div className="no-answers">
            <p>아직 답변이 없습니다. 첫 번째 답변을 남겨보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}

