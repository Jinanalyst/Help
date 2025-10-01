export default function QuestionSkeleton() {
  return (
    <div className="question-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-tag"></div>
        <div className="skeleton-meta"></div>
      </div>
      <div className="skeleton-title"></div>
      <div className="skeleton-excerpt"></div>
      <div className="skeleton-excerpt short"></div>
      <div className="skeleton-actions">
        <div className="skeleton-action"></div>
        <div className="skeleton-action"></div>
        <div className="skeleton-action"></div>
        <div className="skeleton-action"></div>
      </div>
    </div>
  )
}

