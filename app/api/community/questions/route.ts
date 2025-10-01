import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sort = searchParams.get('sort') || 'latest'
    const filter = searchParams.get('filter')
    const q = searchParams.get('q')

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('questions')
      .select('*, user:user_id(*)', { count: 'exact' })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (filter && filter !== 'All') {
      query = query.eq('category', filter)
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Apply sorting
    switch (sort) {
      case 'hot':
        query = query.order('like_count', { ascending: false })
        break
      case 'most_voted':
        query = query.order('vote_score', { ascending: false })
        break
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    return NextResponse.json({
      questions: data || [],
      total: count || 0,
    })
  } catch (error) {
    console.error('Questions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

