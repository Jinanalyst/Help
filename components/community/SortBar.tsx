'use client'

interface SortBarProps {
  sorts: readonly string[]
  active: string
  onChange: (sort: any) => void
  totalCount: number
  lastUpdated: Date
  onRefresh: () => void
  isRefreshing: boolean
}

export default function SortBar({
  sorts,
  active,
  onChange,
  totalCount,
  lastUpdated,
  onRefresh,
  isRefreshing
}: SortBarProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return (
    <div className="sort-bar">
      <div className="sort-buttons">
        {sorts.map((sort) => (
          <button
            key={sort}
            className={`sort-btn ${active === sort ? 'active' : ''}`}
            onClick={() => onChange(sort)}
          >
            {sort}
          </button>
        ))}
      </div>

      <div className="sort-meta">
        <span className="meta-text">
          총 {totalCount.toLocaleString()}개 · {formatTime(lastUpdated)} 업데이트
        </span>
        <button
          className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="새로고침"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 8A6 6 0 1 1 8 2c1.5 0 2.9.6 4 1.5M14 2v4h-4"/>
          </svg>
          <span>새로고침</span>
        </button>
      </div>
    </div>
  )
}

