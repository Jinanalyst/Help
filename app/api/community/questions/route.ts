// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { listQuestions } from '@/lib/server/questions'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sort = (searchParams.get('sort') || 'latest') as 'latest' | 'hot' | 'most_voted'
    const filter = searchParams.get('filter') || undefined
    const q = searchParams.get('q') || undefined

    const data = await listQuestions({ q, limit, offset, sort, filter })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

