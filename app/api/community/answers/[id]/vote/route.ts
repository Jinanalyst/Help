import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { type, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existingVote } = await supabase
      .from('answer_votes')
      .select('*')
      .eq('answer_id', params.id)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      await supabase
        .from('answer_votes')
        .delete()
        .eq('answer_id', params.id)
        .eq('user_id', userId)

      if (existingVote.vote_type === 'up') {
        await supabase.rpc('decrement_answer_votes', { answer_id: params.id })
      } else {
        await supabase.rpc('increment_answer_votes', { answer_id: params.id })
      }

      if (existingVote.vote_type === type) {
        return NextResponse.json({ success: true })
      }
    }

    await supabase
      .from('answer_votes')
      .insert({ 
        answer_id: params.id, 
        user_id: userId,
        vote_type: type 
      })

    if (type === 'up') {
      await supabase.rpc('increment_answer_votes', { answer_id: params.id })
    } else {
      await supabase.rpc('decrement_answer_votes', { answer_id: params.id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Answer vote API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

