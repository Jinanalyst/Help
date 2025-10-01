import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'votes'

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('answers')
      .select('*, user:user_id(*), comments:answer_comments(*)')
      .eq('question_id', params.id)

    if (sort === 'votes') {
      query = query.order('vote_score', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Answers query error:', error)
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 })
    }

    return NextResponse.json({ answers: data || [] })
  } catch (error) {
    console.error('Answers API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('answers')
      .insert({
        question_id: params.id,
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
      })
      .select('*, user:user_id(*)')
      .single()

    if (error) {
      console.error('Answer insert error:', error)
      return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 })
    }

    return NextResponse.json({ answer: data }, { status: 201 })
  } catch (error) {
    console.error('Answer API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

