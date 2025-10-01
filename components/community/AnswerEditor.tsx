'use client'

import { useState } from 'react'

interface AnswerEditorProps {
  onSubmit: (content: string) => Promise<boolean>
  userId: string | null
}

export default function AnswerEditor({ onSubmit, userId }: AnswerEditorProps) {
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || submitting) return

    setSubmitting(true)
    const success = await onSubmit(content)
    if (success) {
      setContent('')
      setPreview(false)
    }
    setSubmitting(false)
  }

  return (
    <div className="answer-editor">
      <h3 className="editor-title">답변 작성</h3>
      
      <div className="editor-tabs">
        <button
          className={!preview ? 'active' : ''}
          onClick={() => setPreview(false)}
        >
          작성
        </button>
        <button
          className={preview ? 'active' : ''}
          onClick={() => setPreview(true)}
          disabled={!content.trim()}
        >
          미리보기
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!preview ? (
          <textarea
            className="editor-textarea"
            placeholder="답변을 작성해주세요. 마크다운을 지원합니다."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            disabled={!userId}
          />
        ) : (
          <div className="editor-preview markdown-content">
            {content || '내용을 입력해주세요'}
          </div>
        )}

        <div className="editor-footer">
          <div className="editor-hints">
            <span className="hint">
              **굵게** *기울임* `코드` [링크](url)
            </span>
          </div>
          <button
            type="submit"
            className="submit-answer-btn"
            disabled={!content.trim() || submitting || !userId}
          >
            {submitting ? '제출 중...' : userId ? '답변 작성' : '로그인 후 작성'}
          </button>
        </div>
      </form>
    </div>
  )
}

