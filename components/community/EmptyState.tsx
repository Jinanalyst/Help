interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="empty-icon">
        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
        <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      </svg>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      {actionText && onAction && (
        <button className="empty-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  )
}

