// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

// Mock suggestions data with popularity scores
// In a real app, this would come from a database
const suggestions = [
  { term: 'How to learn React', popularity: 95 },
  { term: 'JavaScript best practices', popularity: 90 },
  { term: 'CSS Grid tutorial', popularity: 85 },
  { term: 'TypeScript fundamentals', popularity: 88 },
  { term: 'Next.js deployment', popularity: 82 },
  { term: 'Web development tips', popularity: 87 },
  { term: 'Programming interview questions', popularity: 92 },
  { term: 'Code review guidelines', popularity: 80 },
  { term: 'HTML semantic elements', popularity: 75 },
  { term: 'CSS Flexbox guide', popularity: 78 },
  { term: 'Node.js backend development', popularity: 83 },
  { term: 'Database design principles', popularity: 79 },
  { term: 'API design best practices', popularity: 86 },
  { term: 'Git version control', popularity: 91 },
  { term: 'Docker containerization', popularity: 77 },
  { term: 'AWS cloud services', popularity: 84 },
  { term: 'Python programming', popularity: 89 },
  { term: 'Machine learning basics', popularity: 76 },
  { term: 'Data structures and algorithms', popularity: 93 },
  { term: 'Software testing strategies', popularity: 81 }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  let result: string[] = []

  if (!query || query.trim().length === 0) {
    // Return top 8 suggestions by popularity when no query provided
    result = suggestions
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)
      .map(item => item.term)
  } else {
    // Return up to 8 terms that fuzzily match ilike %q%, ordered by popularity
    const searchTerm = query.trim().toLowerCase()
    
    result = suggestions
      .filter(item => 
        item.term.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)
      .map(item => item.term)
  }

  return NextResponse.json({ suggestions: result })
}
