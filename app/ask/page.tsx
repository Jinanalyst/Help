'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?returnUrl=%2Fask')
      } else {
        setUserId(session.user.id)
      }
    })
  }, [router])

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!description.trim()) {
      setError('Description is required')
      return
    }

    if (!userId) {
      setError('You must be logged in to ask a question')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category || 'All',
          tags,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit question')
      }

      // Redirect to question detail
      router.push(`/question/${data.question.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isValid = title.trim().length > 0 && description.trim().length > 0

  return (
    <div className="ask-page">
      <div className="ask-container">
        <div className="breadcrumb">
          <button onClick={() => router.push('/community')}>← 커뮤니티</button>
        </div>

        <div className="ask-header">
          <h1>질문하기</h1>
          <p>커뮤니티에 질문을 올리고 전문가의 답변을 받으세요</p>
        </div>

        <form className="ask-form" onSubmit={handleSubmit}>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              제목 <span className="required">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="구체적인 질문 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              aria-required="true"
              disabled={loading}
            />
            <span className="form-hint">{title.length}/200자</span>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              내용 <span className="required">*</span>
            </label>
            <textarea
              id="description"
              className="form-textarea"
              placeholder="질문 내용을 자세히 설명해주세요. 마크다운을 지원합니다."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
              maxLength={5000}
              disabled={loading}
            />
            <span className="form-hint">{description.length}/5000자</span>
          </div>

          <div className="form-group">
            <label htmlFor="tags" className="form-label">
              태그 (최대 5개)
            </label>
            <div className="tags-input-wrapper">
              <div className="tags-display">
                {tags.map((tag) => (
                  <span key={tag} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="tag-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-input-row">
                <input
                  id="tags"
                  type="text"
                  className="form-input-sm"
                  placeholder="태그 입력 후 Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  disabled={loading || tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="add-tag-btn"
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              카테고리
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">카테고리 선택...</option>
              <option value="Breaking">Breaking</option>
              <option value="Summary">Summary</option>
              <option value="Insight">Insight</option>
              <option value="Analysis">Analysis</option>
              <option value="Crypto">Crypto</option>
              <option value="Macro">Macro</option>
              <option value="Energy">Energy</option>
              <option value="Important">Important</option>
              <option value="Earnings">Earnings</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.back()}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isValid || loading}
              aria-label="질문 게시"
            >
              {loading ? '게시 중...' : '질문 게시'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

