// Force dynamic rendering to prevent SSG issues
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { searchEverything } from '@/lib/server/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()
    const limitParam = searchParams.get('limit')
    const preview = searchParams.get('preview') === '1'
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), preview ? 5 : 10) : preview ? 5 : 10

    if (!query) {
      return NextResponse.json({ 
        error: 'Query parameter "q" is required' 
      }, { status: 400 })
    }

    const data = await searchEverything(query, limit)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ 
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
