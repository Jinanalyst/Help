'use client'

interface FilterChipsProps {
  filters: string[]
  active: string
  onChange: (filter: string) => void
}

export default function FilterChips({ filters, active, onChange }: FilterChipsProps) {
  return (
    <div className="filter-chips-container">
      <div className="filter-chips">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-chip ${active === filter ? 'active' : ''}`}
            onClick={() => onChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}

